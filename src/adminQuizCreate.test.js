import { adminQuizCreate } from './quiz.js';
import { adminAuthRegister } from './auth.js'
import { clear } from './other.js';

let id;

beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned is object which has a quizId and quizId is a number', () => {
    let result = adminQuizCreate(id, 'Quiz Name', 'Description');
    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({
      quizId: expect.any(Number)
    });
    expect(result).not.toBeNull();
  })
});

describe('Test error cases', () => {
  test('Invalid userId - When id doens\'t exist', () => {
    let result = adminQuizCreate(id + 999, 'Quiz Name', 'Description');

    expect(result).toMatchObject({ error: expect.any(String) });
  })

  describe('Test vadility of name', () => {
    test.each([
      { name: '@Quiz_Name!!!', description: 'Name contains invalid characters' },
      { name: 'Hi', description: 'Name is too short without spaces' },
      { name: ' I', description: 'Name is too short with spaces'},
      { name: '', description: 'Name is too short empty string'},
      { name: 'HiIamQuiz1234567890abcdefghijkl', description: 'Name is too long with no spaces'},
      { name: ' Hi I am Quiz 1234567890 abcdef', description: 'Name is too long with spaces at front'},
      { name: 'Hi I am Quiz 1234567890 abcdef ', description: 'Name is too long with spaces at end'},
      { name: 'Hi I am Quiz 123 456 7890 abc def', description: 'Name is too long with normal spaces'},
    ])('Invalid name - %s', ({name, description}) => {
      let result = adminQuizCreate(id, name, description);
      expect(result).toMatchObject({ error: expect.any(String) });
    });

    test.each([
      { name: 'And', reason: 'Name has 3 more valid characters with no spaces' },
      { name: 'H i', reason: 'Name 1 with 3 more valid characters with spaces' },
      { name: ' Hi', reason: 'Name 2 with 3 more valid characters with spaces'},
      { name: 'Hi ', reason: 'Name 3 with 3 more valid characters with spaces'},
      { name: ' I ', reason: 'Name 4 with 3 more valid characters with spaces'},
      { name: 'HiIamQuiz1234567890abcdefghijk', reason: 'Name with 30 or less valid characters with no spaces'},
      { name: ' Hi I am Quiz 1234567890 abcde', reason: 'Name with 30 or less valid characters with spaces at front'},
      { name: 'Hi I am Quiz 1234567890 abcde ', reason: 'Name with 30 or less valid characters with spaces at end'},
      { name: 'Hi I am Quiz 12345 67890 abcde', reason: 'Name with 30 or less valid characters with normal spaces'},
    ])('Valid name - %s', ({name, reason}) => {
      let result = adminQuizCreate(id, name, 'Description');
      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({
        quizId: expect.any(Number)
      });
      expect(result).not.toBeNull();
    });

    test('Invalid name - Name is already used by current logged in user', () => {

      let result1 = adminQuizCreate(id, 'Quiz Name', 'Description');
      let result2 = adminQuizCreate(id, 'Quiz Name', 'Description');

      expect(typeof result1).toBe('object');
      expect(result1).toStrictEqual({
        quizId: expect.any(Number)
      });
      expect(result1).not.toBeNull();
      
      expect(result2).toMatchObject({ error: expect.any(String) });
    });
  });
    
    describe('Test vadility of Description', () => {

      test.each([
        { description: 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTU VWXYZ 123456 7890 ! @ # $ % ^ & * ( ) _ + - =', reason: 'Description is more than 100 characters with normal spaces' },
        { description: '  abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTUVWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =', reason: 'Description is more than 100 characters with spaces at the front' },
        { description: 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTUVWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =  ', reason: 'Description is more than 100 characters with spaces at the end' },
      ])('Invalid description - %s', ({description, reason}) => {
        let result = adminQuizCreate(id, 'Quiz Name', description);
        expect(result).toMatchObject({ error: expect.any(String) });
      })

      test.each([
        { description: '', reason: 'Empty string' },
        { description: 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTU VWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =', reason: 'Description with 100 characters' },
      ])('Valid description - %s', ({description, reason}) => {
        let result = adminQuizCreate(id, 'Quiz Name', description);
        expect(typeof result).toBe('object');
        expect(result).toStrictEqual({
          quizId: expect.any(Number)
        });
        expect(result).not.toBeNull();
      })
    })
});