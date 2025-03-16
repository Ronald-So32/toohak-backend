import { clear } from '../src/other.js';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails
} from '../src/auth.js';
import {
  adminQuizCreate,
  adminQuizList
} from '../src/quiz.js';

describe('clear', () => {
  test('clear returns an empty object', () => {
    // Clear should always return an empty object, so check that first
    const result = clear();
    expect(result).toEqual({});
  });

  test('clear resets the application state', () => {
    // Register a first user
    const user1 = adminAuthRegister('user1@example.com', 'password123', 'First', 'User');

    // Create a quiz with this user
    const quizId = adminQuizCreate(user1.userId, 'Test Quiz', 'Test Description').quizId;

    // Check the user can log in
    const loginResult = adminAuthLogin('user1@example.com', 'password123');
    expect(loginResult).toHaveProperty('userId');
    // Checks that the user details exist and the successful login attempt is updated
    const userDetails = adminUserDetails(user1.userId);
    expect(userDetails).toStrictEqual({
      user: {
        userId: user1.userId,
        name: 'First User',
        email: 'user1@example.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });

    // Verify a quiz exists
    expect(adminQuizList(user1.userId)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Test Quiz',
        }
      ]
    });

    clear();
    // Try to obtain user details and quiz list which should not exist after clear
    expect(adminUserDetails(user1.userId)).toStrictEqual({ error: expect.any(String) });
    expect(adminQuizList(user1.userId)).toStrictEqual({ error: expect.any(String) });
    // Register the same user again
    const user1Again = adminAuthRegister('user1@example.com', 'password123', 'First', 'User');
    expect(user1Again).toHaveProperty('userId');

    // The quiz list for user should be empty
    const emptyQuizList = adminQuizList(user1Again.userId);
    expect(emptyQuizList.quizzes).toEqual([]);

    // Register another user to make sure multiple registrations work after clear
    const user2 = adminAuthRegister('user2@example.com', 'password456', 'Second', 'User');
    expect(user2).toHaveProperty('userId');
    expect(user2.userId).not.toEqual(user1Again.userId);
  });
});
