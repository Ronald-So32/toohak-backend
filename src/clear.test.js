<<<<<<< HEAD
import { clear } from './other.js';
import { getData } from './dataStore.js';
// Only clearing dataStore for now

describe('clear', () => {
  test('clear returns an empty object', () => {
=======
import { clear } from './clear';
import { adminAuthRegister, adminAuthLogin, adminUserDetails } from './auth';
import { adminQuizCreate, adminQuizList } from './quiz';

describe('clear', () => {
  test('clear returns an empty object', () => {
    // Clear should always return an empty object, so check that first
>>>>>>> master
    const result = clear();
    expect(result).toEqual({});
  });

<<<<<<< HEAD
  test('clear resets the data store', () => {
    // Manually add data to simulate state
    const dataStore = getData();
    
    // Add test user
    dataStore.users.push({
      userId: 1,
      nameFirst: 'Test',
      nameLast: 'User',
      email: 'test@example.com',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
      password: 'password123',
    });
    
    // Add test quiz
    dataStore.quizzes.push({
      quizId: 1,
      name: 'Test Quiz',
      timeCreated: Date.now(),
      timeLastEdited: Date.now(),
      description: 'Test Description',
      createdBy: 1,
    });
    
    // Verify data exists before clearing
    expect(dataStore.users).toEqual([{
      userId: 1,
      nameFirst: 'Test',
      nameLast: 'User',
      email: 'test@example.com',
      numSuccessfulLogins: 1,
      numFailedPasswordsSinceLastLogin: 0,
      password: 'password123',
    }]);

    expect(dataStore.quizzes).toEqual([{
      quizId: 1,
      name: 'Test Quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Test Description',
      createdBy: 1,
    }]);
    
    // Call clear function
    clear();
    
    // Verify data cleared
    const dataAfterClear = getData();
    expect(dataAfterClear.users).toEqual([]);
    expect(dataAfterClear.quizzes).toEqual([]);
=======
  test('clear resets the application state', () => {
    // Register a first user
    const user1 = adminAuthRegister('user1@example.com', 'password123', 'First', 'User');
    
    // Create a quiz with this user
    const quiz = adminQuizCreate(user1.userId, 'Test Quiz', 'Test Description');
    
    // Check the user can log in
    const loginResult = adminAuthLogin('user1@example.com', 'password123');
    expect(loginResult).toHaveProperty('userId');
    
    // Verify a quiz exists
    const quizList = adminQuizList(user1.userId);
    
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
>>>>>>> master
  });
});