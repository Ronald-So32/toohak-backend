import { adminQuizCreate, adminQuizNameUpdate } from './quiz.js';
import { adminAuthRegister } from './auth.js'
import { clear } from './other.js';

let userId;
let quizId;

beforeEach(() => {
  clear();
  userId = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
  quizId = adminQuizCreate(userId, 'Quiz Name', 'Description').quizId;
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned is object which is empty', () => {
    let result = adminQuizNameUpdate(userId, quizId, 'New Quiz Name');
    expect(typeof result).toBe('object');
    expect(result).toEqual({});
    expect(result).not.toBeNull();
  })
});

describe('Test error cases', () => {
  test('Invalid userId - When id doesn\'t exist', () => {
    let result = adminQuizNameUpdate(userId + 999, quizId, 'New Quiz Name');
    expect(result).toMatchObject({ error: expect.any(String) });
  })

  test('Invalid quizId - When quiz doesn\'t exist', () => {
    let result = adminQuizNameUpdate(userId, quizId + 999, 'New Quiz Name');
    expect(result).toMatchObject({ error: expect.any(String) });
  })

  test('Invalid quizId - When quiz is not owned by user', () => {
    // Create a second user
    const userId2 = adminAuthRegister('email2@email.com', 'Password1', 'First', 'Last').userId;
    // Create a quiz for second user
    const quizId2 = adminQuizCreate(userId2, 'Quiz Name 2', 'Description').quizId;
    
    // Try to update first user's quiz with second user's ID
    let result = adminQuizNameUpdate(userId2, quizId, 'New Quiz Name');
    expect(result).toMatchObject({ error: expect.any(String) });
  })
  
  describe('Test validity of name', () => {
    test.each([
      { name: '@Quiz_Name!!!', description: 'Name contains invalid characters' },
      { name: 'Hi', description: 'Name is too short without spaces' },
      { name: ' I', description: 'Name is too short with spaces'},
      { name: '', description: 'Name is too short empty string'},
      { name: 'HiIamQuiz1234567890abcdefghijkl', description: 'Name is too long with no spaces'},
      { name: ' Hi I am Quiz 1234567890 abcdef', description: 'Name is too long with spaces at front'},
      { name: 'Hi I am Quiz 1234567890 abcdef ', description: 'Name is too long with spaces at end'},
      { name: 'Hi I am Quiz 123 456 7890 abc def', description: 'Name is too long with normal spaces'},
    ])('Invalid name - "%s" %s', ({name, description}) => {
      let result = adminQuizNameUpdate(userId, quizId, name);
      expect(result).toMatchObject({ error: expect.any(String) });
    });

    test.each([
      { name: 'And', description: 'Name has 3 more valid characters with no spaces' },
      { name: 'H i', description: 'Name 1 with 3 more valid characters with spaces' },
      { name: ' Hi', description: 'Name 2 with 3 more valid characters with spaces'},
      { name: 'Hi ', description: 'Name 3 with 3 more valid characters with spaces'},
      { name: ' I ', description: 'Name 4 with 3 more valid characters with spaces'},
      { name: 'HiIamQuiz1234567890abcdefghijk', description: 'Name with 30 or less valid characters with no spaces'},
      { name: ' Hi I am Quiz 1234567890 abcde', description: 'Name with 30 or less valid characters with spaces at front'},
      { name: 'Hi I am Quiz 1234567890 abcde ', description: 'Name with 30 or less valid characters with spaces at end'},
      { name: 'Hi I am Quiz 12345 67890 abcde', description: 'Name with 30 or less valid characters with normal spaces'},
    ])('Valid name - "%s" %s', ({name, description}) => {
      let result = adminQuizNameUpdate(userId, quizId, name);
      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    });

    test('Invalid name - Name is already used by current logged in user', () => {
      // Create another quiz with a different name
      let anotherQuizId = adminQuizCreate(userId, 'Another Quiz', 'Description').quizId;
      
      // Try to update the name of this quiz to the name of the first quiz
      let result = adminQuizNameUpdate(userId, anotherQuizId, 'Quiz Name');
      
      expect(result).toMatchObject({ error: expect.any(String) });
    });
  });
});