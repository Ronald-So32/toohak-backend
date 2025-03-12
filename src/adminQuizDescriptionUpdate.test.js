import { adminQuizCreate, adminQuizDescriptionUpdate } from './quiz.js';
import { adminAuthRegister } from './auth.js'
import { clear } from './other.js';

let id;

beforeAll(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last');
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned is object which is empty', () => {
    let quizId = adminQuizCreate(id.userId, 'Quiz Name', 'Description').quizId;
    let result = adminQuizDescriptionUpdate(id.userId, quizId, 'New Description');
    expect(typeof result).toBe('object');
    expect(result).toEqual({});
    expect(result).not.toBeNull();
  })
});

describe('Test error cases', () => {
  test('Invalid userId - When id doesn\'t exist', () => {
    let quizId = adminQuizCreate(id.userId, 'Quiz for Invalid User Test', 'Description').quizId;
    let result = adminQuizDescriptionUpdate(id.userId + 999, quizId, 'New Description');
    expect(result).toMatchObject({ error: expect.any(String) });
  })

  test('Invalid quizId - When quiz doesn\'t exist', () => {
    let quizId = adminQuizCreate(id.userId, 'Quiz for Invalid Quiz Test', 'Description').quizId;
    let result = adminQuizDescriptionUpdate(id.userId, quizId + 999, 'New Description');
    expect(result).toMatchObject({ error: expect.any(String) });
  })

  test('Invalid quizId - When quiz is not owned by user', () => {
    // Create a second user
    const userId2 = adminAuthRegister('email2@email.com', 'Password1', 'First', 'Last').userId;
    // Create a quiz for first user
    const quizId = adminQuizCreate(id.userId, 'Quiz for Ownership Test', 'Description').quizId;
    
    // Try to update first user's quiz with second user's ID
    let result = adminQuizDescriptionUpdate(userId2, quizId, 'New Description');
    expect(result).toMatchObject({ error: expect.any(String) });
  })
  
  // To test the vadility of descriptions
  describe('Test vadility of Description', () => {
    // To test the Invalid descriptions
    test.each([
      {
        description: 'ab 12 '.repeat(20) + '! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description is more than 100 characters with normal spaces'
      },
      {
        description: ' ab 12'.repeat(20) + '! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description is more than 100 characters with spaces at the front'
      },
      { 
        description: 'aB 12 '.repeat(20) + '! @ # $ % ^ & * ( ) _ + - = ',
        reason: 'Description is more than 100 characters with spaces at the end'
      },
    ])('Invalid description - $reason', ({description, reason}) => {
      let result = adminQuizCreate(id, 'Quiz Name', description);

      expect(result).toMatchObject({ error: expect.any(String) });

      // To test that no quizzes is created
      expect(adminQuizList).toMatchObject({quizzes: []});
      expect(adminQuizInfo).toMatchObject({});
    })

    // To test valid descriptions
    test.each([
      { 
        description: '',
        reason: 'Empty string'
      },
      { 
        description: 'aB 12 '.repeat(12) + ' ! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description with 100 characters'
      },
    ])('Valid description - $reason', ({ description, reason }) => {
      let result = adminQuizCreate(id, 'Quiz Name', description);
      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({
        quizId: result.quizId
      });
    });
  });
})