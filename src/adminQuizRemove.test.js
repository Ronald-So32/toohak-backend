import { adminQuizCreate, adminQuizDescriptionUpdate } from './quiz.js';
import { adminAuthRegister } from './auth.js'
import { clear } from './other.js';

let userId;
let quizId;

//For a clean start before every test
beforeEach(() => {
    clear();
    userId = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
    quizId = adminQuizCreate(userId, 'Quiz Name', 'Description').quizId;
});

  
describe('Test correct return type and normal usage case', () => {
    test('Test if the returned is an empty object', () => {
      let result = adminQuizRemove(userId, quizId);
      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })
});

//Test for basic error cases
describe('Test error cases', () => {
    test('Invalid userId - When id doesn\'t exist', () => {
      let result = adminQuizRemove(userId + 999, quizId);
      expect(result).toMatchObject({ error: expect.any(String) });
    })
  
    test('Invalid quizId - When quiz doesn\'t exist', () => {
      let result = adminQuizRemove(userId, quizId + 999);
      expect(result).toMatchObject({ error: expect.any(String) });
    })
  
    test('Invalid quizId - When quiz is not owned by user', () => {
      const userId2 = adminAuthRegister('email2@email.com', 'Password2', 'Second', 'User').userId;
      let result = adminQuizRemove(userId2, quizId);
      expect(result).toMatchObject({ error: expect.any(String) });
    })
  
    test('Invalid operation - Removing an already removed quiz', () => {
      adminQuizRemove(userId, quizId);
      let result = adminQuizRemove(userId, quizId);
      expect(result).toMatchObject({ error: expect.any(String) });
    })
});
 
//Validating if quiz removal was a success or not
describe('Test successful quiz removal', () => {
    test('Successfully remove a quiz and verify it\'s gone', () => {
      let removeResult = adminQuizRemove(userId, quizId);
      expect(removeResult).toEqual({});
  
      // Attempt to remove the same quiz again should fail
      let secondRemoveAttempt = adminQuizRemove(userId, quizId);
      expect(secondRemoveAttempt).toMatchObject({ error: expect.any(String) });
    })
  
    test('Remove multiple quizzes successfully', () => {
      const quizId2 = adminQuizCreate(userId, 'Second Quiz', 'Another Description').quizId;
      
      let removeResult1 = adminQuizRemove(userId, quizId);
      let removeResult2 = adminQuizRemove(userId, quizId2);
  
      expect(removeResult1).toEqual({});
      expect(removeResult2).toEqual({});
    })
});