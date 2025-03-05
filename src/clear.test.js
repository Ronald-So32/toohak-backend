import { clear } from './other.js';
import { getData } from './dataStore.js';
// Only clearing dataStore for now

describe('clear', () => {
  test('clear returns an empty object', () => {
    const result = clear();
    expect(result).toEqual({});
  });

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
  });
});