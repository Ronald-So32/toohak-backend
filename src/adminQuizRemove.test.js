import {
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate
} from './quiz.js';
import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

let userId;
let quizId;

// For a clean start before every test
beforeEach(() => {
  clear();
  userId = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
  quizId = adminQuizCreate(userId, 'Quiz Name', 'Description').quizId;
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned object is empty', () => {
    const result = adminQuizRemove(userId, quizId);
    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({});
    expect(result).not.toBeNull();
  });
});

// Tests for basic error cases
describe('Test error cases', () => {
  test('Invalid userId - When id doesn\'t exist', () => {
    const result = adminQuizRemove(userId + 999, quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid quizId - When quiz doesn\'t exist', () => {
    const result = adminQuizRemove(userId, quizId + 999);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid quizId - When quiz is not owned by user', () => {
    // Create a second user
    const userId2 = adminAuthRegister('email2@email.com', 'Password2', 'Second', 'User').userId;

    // Trying to remove quiz created by first user by second user ID
    const result = adminQuizRemove(userId2, quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid operation - Removing an already removed quiz', () => {
    adminQuizRemove(userId, quizId);
    const result = adminQuizRemove(userId, quizId);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

// Validating if quiz removal was a success or not
describe('Test successful quiz removal', () => {
  test('Successfully remove a quiz and verify it\'s gone', () => {
    const removeResult = adminQuizRemove(userId, quizId);
    expect(removeResult).toStrictEqual({});

    // This test attempts to remove the same quiz again which should fail
    const secondRemoveAttempt = adminQuizRemove(userId, quizId);
    expect(secondRemoveAttempt).toStrictEqual({ error: expect.any(String) });
  });

  test('Verify quiz info after removal', () => {
    adminQuizRemove(userId, quizId);
    const quizInfoResult = adminQuizInfo(userId, quizId);
    expect(quizInfoResult).toStrictEqual({ error: expect.any(String) });
  });

  test('Remove multiple quizzes successfully', () => {
    const quizId2 = adminQuizCreate(userId, 'Second Quiz', 'Another Description').quizId;

    const removeResult1 = adminQuizRemove(userId, quizId);
    const removeResult2 = adminQuizRemove(userId, quizId2);

    expect(removeResult1).toStrictEqual({});
    expect(removeResult2).toStrictEqual({});
  });
});

// Additional tests to validate interactions with other functions
describe('Test interactions with other functions', () => {
  // This test creates and removes a quiz
  test('Verify quiz creation and removal', () => {
    const newQuizId = adminQuizCreate(userId, 'New Quiz', 'New Description').quizId;
    const removeResult = adminQuizRemove(userId, newQuizId);
    expect(removeResult).toStrictEqual({});

    const quizInfoResult = adminQuizInfo(userId, newQuizId);
    expect(quizInfoResult).toStrictEqual({ error: expect.any(String) });
  });

  // This test tries to remove a quiz after changing it's name
  test('Verify quiz update and removal', () => {
    adminQuizNameUpdate(userId, quizId, 'Updated Quiz Name');
    const removeResult = adminQuizRemove(userId, quizId);
    expect(removeResult).toStrictEqual({});
  });
});
