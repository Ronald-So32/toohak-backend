import {
  adminAuthLogin,
  adminAuthRegister,
  adminUserDetails,
  adminUserPasswordUpdate
} from '../src/auth.js';
import { clear } from '../src/other.js';

let id;

beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'first', 'last').userId;
});

describe('Test correct return types', () => {
  test('Test if the return is an object and is an userId', () => {
    const result = adminAuthLogin('email@email.com', 'Password1');
    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({
      userId: id
    });
    expect(result).not.toBeNull();
  });
});

describe('Test error cases', () => {
  describe('Test if the email exists', () => {
    test('Email exists', () => {
      const result = adminAuthLogin('email@email.com', 'Password1');

      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({
        userId: id
      });
      expect(result).not.toBeNull();
    });

    test('Email doesn\'t exists', () => {
      const result = adminAuthLogin('emailw@email.com', 'Password1');

      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Test if the password is correct', () => {
    test('Password is correct', () => {
      const result = adminAuthLogin('email@email.com', 'Password1');

      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({
        userId: id
      });
      expect(result).not.toBeNull();
    });

    test('Password is incorrect', () => {
      const result = adminAuthLogin('email@email.com', 'Password2');

      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });
});

describe('Test that the function works as intended', () => {
  test('Verify user details after registration and login', () => {
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

  test('Verify login after password update', () => {
    const update = adminUserPasswordUpdate(id, 'Password1', 'Password2');
    expect(update).toStrictEqual({});

    const result = adminAuthLogin('email@email.com', 'Password2');
    expect(result).toStrictEqual({ userId: id });

    const details = adminUserDetails(id);
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
  });

  test('Verify failed login attempts', () => {
    const failedLogin = adminAuthLogin('email@email.com', 'WrongPassword');
    expect(failedLogin).toStrictEqual({ error: expect.any(String) });

    const details = adminUserDetails(id);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
  });
});
