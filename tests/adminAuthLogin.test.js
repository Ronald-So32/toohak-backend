import {
  adminAuthLogin,
  adminAuthRegister,
  adminUserDetails,
  adminUserPasswordUpdate
} from '../src/auth.js';
import { clear } from '../src/other.js';

let id;
let result;
let details;

// Clears the data then registers and logins the user before each test
beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'first', 'last').userId;
  result = adminAuthLogin('email@email.com', 'Password1');
  details = adminUserDetails(id);
});

describe('Test correct return types and the registeration of a sucessful login', () => {
  test('Test if the return is an object and is an userId', () => {
    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({ userId: id });
    expect(result).not.toBeNull();
    // Makes sure that the login attempt is registered as a sucessful login in userDetails
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
  });
});

describe('Test error cases', () => {
  describe('Test if the email exists', () => {
    test('Email exists', () => {
      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({ userId: id });
      expect(result).not.toBeNull();

      expect(details.user.numSuccessfulLogins).toStrictEqual(2);
      // Makes sure that it doesn't count to failed login attempt
      expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('Email doesn\'t exists', () => {
      // Overrides the result from beforeEach with a failed attempt to login with a non-existent email
      result = adminAuthLogin('emailw@email.com', 'Password1');

      expect(result).toStrictEqual({ error: expect.any(String) });
      // Makes sure that attempt to login with invalid email doesn't count toward existing user's login count
      expect(details.user.numSuccessfulLogins).toStrictEqual(2);
      expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });

  describe('Test if the password is correct', () => {
    test('Password is correct', () => {
      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({
        userId: id
      });
      expect(result).not.toBeNull();
      expect(details.user.numSuccessfulLogins).toStrictEqual(2);
      expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('Password is incorrect', () => {
      // Overrides the result from beforeEach with a failed attempt to login with a non-existent email
      result = adminAuthLogin('email@email.com', 'Password2');

      // To retrives the latest details of user
      details = adminUserDetails(id);
      expect(result).toStrictEqual({ error: expect.any(String) });

      expect(details.user.numSuccessfulLogins).toStrictEqual(2);
      // Makes sure that the login attempt is registered as a unsucessful login in userDetails
      expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });
  });
});

describe('Test that the function works as intended', () => {
  test('Verify user details after registration and login', () => {
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
    // To update users password
    const update = adminUserPasswordUpdate(id, 'Password1', 'Password2');
    expect(update).toStrictEqual({});

    result = adminAuthLogin('email@email.com', 'Password2');
    expect(result).toStrictEqual({ userId: id });

    details = adminUserDetails(id);
    expect(details.user.numSuccessfulLogins).toStrictEqual(3);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
  });

  test('Verify failed login attempts', () => {
    const failedLogin = adminAuthLogin('email@email.com', 'WrongPassword');
    expect(failedLogin).toStrictEqual({ error: expect.any(String) });

    details = adminUserDetails(id);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
  });

  describe('Test that the numFailedPasswordSinceLastLogin will reset', () => {
    test('Record of logins will reset', () => {
      const failedLogin = adminAuthLogin('email@email.com', 'WrongPassword');
      expect(failedLogin).toStrictEqual({ error: expect.any(String) });
      details = adminUserDetails(id);
      expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);

      adminAuthLogin('email@email.com', 'Password1');
      details = adminUserDetails(id);
      expect(details.user.numSuccessfulLogins).toStrictEqual(3);
      // The failed attempts to login with wrong password should reset after a sucessful login
      expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
});
