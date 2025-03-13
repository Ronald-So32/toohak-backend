import {
  adminUserDetails,
  adminAuthRegister,
  adminAuthLogin,
  adminUserPasswordUpdate,
  adminUserDetailsUpdate
} from '../src/auth.js';
import { clear } from '../src/other.js';

describe('Test adminUserDetails functionality', () => {
  let userId;

  beforeEach(() => {
    clear();
    userId = adminAuthRegister('email@email.com', 'Password1', 'first', 'last').userId;
  });

  test('Test if the return type is expected', () => {
    const result = adminUserDetails(userId);
    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({
      user: {
        userId,
        name: 'first last',
        email: 'email@email.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
    expect(result).not.toBeNull();
  });

  test.each([
    {
      description: 'Initial login',
      actions: [
        { type: 'login', password: 'Password1' },
      ],
      expectedSuccessfulLogins: 2,
      expectedFailedLogins: 0,
    },
    {
      description: 'After successful login',
      actions: [
        { type: 'login', password: 'Password1' },
        { type: 'login', password: 'Password1' },
      ],
      expectedSuccessfulLogins: 3,
      expectedFailedLogins: 0,
    },
    {
      description: 'After failed login',
      actions: [
        { type: 'login', password: 'Password1' },
        { type: 'login', password: 'Password2' },
      ],
      expectedSuccessfulLogins: 2,
      expectedFailedLogins: 1,
    },
    {
      description: 'After successful login post failed attempt',
      actions: [
        { type: 'login', password: 'Password2' },
        { type: 'login', password: 'Password1' },
      ],
      expectedSuccessfulLogins: 2,
      expectedFailedLogins: 1,
    },
  ])('Test login counts: %s', ({ actions, expectedSuccessfulLogins, expectedFailedLogins }) => {
    actions.forEach((action) => {
      adminAuthLogin('email@email.com', action.password);
    });
  
    const result = adminUserDetails(userId);
    expect(result).toStrictEqual({
      user: {
        userId,
        name: 'first last',
        email: 'email@email.com',
        numSuccessfulLogins: expectedSuccessfulLogins,
        numFailedPasswordsSinceLastLogin: expectedFailedLogins,
      },
    });
  });

  test('Test user details update', () => {
    adminUserDetailsUpdate(userId, 'newemail@email.com', 'newfirst', 'newlast');
    const result = adminUserDetails(userId);
    expect(result).toStrictEqual({
      user: {
        userId,
        name: 'newfirst newlast',
        email: 'newemail@email.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('Test password update and login', () => {
    adminUserPasswordUpdate(userId, 'Password1', 'NewPassword1');
    const loginResult = adminAuthLogin('email@email.com', 'NewPassword1');
    expect(loginResult).toStrictEqual({ userId });

    const details = adminUserDetails(userId);
    expect(details).toStrictEqual({
      user: {
        userId,
        name: 'first last',
        email: 'email@email.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('Test invalid userId', () => {
    const result = adminUserDetails(userId + 727);
    expect(result).toStrictEqual({ error: expect.any(String) });
  });
});

describe('Check normal usage cases', () => {
  test('Normal case 1', () => {
    const result = adminAuthLogin('email@email.com', 'Password1');
    const details = adminUserDetails(result.userId);
    expect(details).toStrictEqual({
      user: {
        userId: result.userId,
        name: 'first last',
        email: 'email@email.com',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });
});
