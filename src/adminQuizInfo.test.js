import { adminQuizCreate, adminQuizInfo } from './quiz.js';
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
    test('Test if the returned object has correct properties and types', () => {
      let result = adminQuizInfo(userId, quizId);
      expect(typeof result).toBe('object');
      expect(result).toEqual({
        quizId: expect.any(Number),
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String)
      });
      expect(result).not.toBeNull();
    })
});

//Tests for basic error cases
describe('Test error cases', () => {
    test('Invalid userId - When id doesn\'t exist', () => {
      let result = adminQuizInfo(userId + 999, quizId);
      expect(result).toMatchObject({ error: expect.any(String) });
    })
  
    test('Invalid quizId - When quiz doesn\'t exist', () => {
      let result = adminQuizInfo(userId, quizId + 999);
      expect(result).toMatchObject({ error: expect.any(String) });
    })
  
    test('Invalid quizId - When quiz is not owned by user', () => {
      //Create a second user
      const userId2 = adminAuthRegister('email2@email.com', 'Password2', 'Second', 'User').userId;

      //Trying to get info of quiz created by frist user by seccond user ID
      let result = adminQuizInfo(userId2, quizId);
      expect(result).toMatchObject({ error: expect.any(String) });
    })
});

//Validating the integrity of detalis given by the fucntion
describe('Test quiz info details', () => {
    test('Verify correct quiz details are returned', () => {
      let result = adminQuizInfo(userId, quizId);
      expect(result).toMatchObject({
        quizId: quizId,
        name: 'Quiz Name',
        description: 'Description'
      });
      expect(result.timeCreated).toBeLessThanOrEqual(Date.now());
      expect(result.timeLastEdited).toBeLessThanOrEqual(Date.now());
    })
  
    test('Verify time last edited updates after quiz modification', () => {
      let initialInfo = adminQuizInfo(userId, quizId);
      // Simulating some passsing of time
      jest.advanceTimersByTime(1000);
      // Modify the quiz
      adminQuizNameUpdate(userId, quizId, 'Updated Quiz Name');
      let updatedInfo = adminQuizInfo(userId, quizId);
      expect(updatedInfo.timeLastEdited).toBeGreaterThan(initialInfo.timeLastEdited);
    })
});