import { clear } from './other.js';
import { adminAuthRegister, adminAuthLogin } from './auth.js';
import { adminQuizCreate, adminQuizList } from './quiz.js';

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
    adminQuizCreate(user1.userId, 'Test Quiz', 'Test Description');

    // Check the user can log in
    const loginResult = adminAuthLogin('user1@example.com', 'password123');
    expect(loginResult).toHaveProperty('userId');

    // Verify a quiz exists
    adminQuizList(user1.userId);

    clear();

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
