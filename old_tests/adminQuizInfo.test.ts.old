import {
  adminQuizCreate,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizRemove
} from '../src/quiz.ts';
import { adminAuthRegister } from '../src/auth.ts';
import { clear } from '../src/other.ts';

let userId;
let quizId;
let result;

// To clear all the data before each test and register a user and creates a quiz for it's info
beforeEach(() => {
  clear();
  userId = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
  quizId = adminQuizCreate(userId, 'Quiz Name', 'Description').quizId;
  result = adminQuizInfo(userId, quizId);
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned object has correct properties and types', () => {
    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description'
    });
    expect(result).not.toBeNull();
  });
});

describe('Test error cases', () => {
  test('Invalid userId - When id doesn\'t exist', () => {
    // To override current results
    result = adminQuizInfo(userId + 999, quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid quizId - When quiz doesn\'t exist', () => {
    result = adminQuizInfo(userId, quizId + 999);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid quizId - When quiz is not owned by user', () => {
    // Create a second user
    const userId2 = adminAuthRegister('email2@email.com', 'Password2', 'Second', 'User').userId;

    // Trying to get info of quiz created by first user by second user ID
    result = adminQuizInfo(userId2, quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

// Validating the integrity of details given by the function
describe('Test quiz info details', () => {
  test('Verify correct quiz details are returned', () => {
    expect(result).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      description: 'Description',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number)
    });
    // To make sure that the time is not in the future
    expect(result.timeCreated).toBeLessThanOrEqual(Date.now());
    expect(result.timeLastEdited).toBeLessThanOrEqual(Date.now());
  });

  test('Verify time last edited updates after quiz modification', async () => {
    // Simulating some passing of time
    await new Promise((delay) => setTimeout(delay, 2000));
    // Modify the quiz
    adminQuizNameUpdate(userId, quizId, 'Updated Quiz Name');
    const updatedInfo = adminQuizInfo(userId, quizId);
    expect(updatedInfo.timeLastEdited).toBeGreaterThan(result.timeLastEdited);
    expect(updatedInfo.name).toBe('Updated Quiz Name');
  });
});

// Additional tests to validate interactions with other functions
describe('Test interactions with other functions', () => {
  test('Verify quiz creation and info retrieval', () => {
    const newQuizId = adminQuizCreate(userId, 'New Quiz', 'New Description').quizId;
    const newQuizInfo = adminQuizInfo(userId, newQuizId);
    expect(newQuizInfo.name).toBe('New Quiz');
    expect(newQuizInfo.description).toBe('New Description');
  });

  test('Verify quiz name update and info retrieval', () => {
    adminQuizNameUpdate(userId, quizId, 'Updated Quiz Name');
    const updatedQuizInfo = adminQuizInfo(userId, quizId);
    expect(updatedQuizInfo.name).toBe('Updated Quiz Name');
  });

  test('Verify quiz description update and info retrieval', () => {
    adminQuizDescriptionUpdate(userId, quizId, 'Updated Description');
    const updatedQuizInfo = adminQuizInfo(userId, quizId);
    expect(updatedQuizInfo.description).toBe('Updated Description');
  });

  test('Verify quiz removal and info retrieval', () => {
    adminQuizRemove(userId, quizId);
    expect(adminQuizInfo(userId, quizId)).toStrictEqual({ error: expect.any(String) });
  });
});
