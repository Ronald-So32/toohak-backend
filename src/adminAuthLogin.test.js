import { adminAuthLogin, adminAuthRegister, adminUserDetails, adminUserPasswordUpdate } from './auth.js';
import { clear } from './other.js';

describe('Test correct return types', () => {
  beforeEach(() => {
    clear();
    adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
  });

  test('Test if the return is an object', () => {
    const result = adminAuthLogin('email@email.com', 'Password1');
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  test('Test if the return object has a userId', () => {
    const result = adminAuthLogin('email@email.com', 'Password1');
    expect(result).toStrictEqual({
      userId: expect.any(Number)
    });
    expect(result).not.toBeNull();
  });
});

describe('Test error cases', () => {
  beforeEach(() => {
    clear();
    adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
  });

  describe('Test if the email exists', () => {
    test.each([
      ['Email exists', 'email@email.com', 'Password1', { userId: expect.any(Number) }],
      ['Email doesn\'t exist', 'emailw@email.com', 'Password1', { error: expect.any(String) }]
    ])('%s', (description, email, password, expected) => {
      const result = adminAuthLogin(email, password);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('Test if the password is correct', () => {
    test.each([
      ['Password is correct', 'email@email.com', 'Password1', { userId: expect.any(Number) }],
      ['Password is incorrect', 'email@email.com', 'Password2', { error: expect.any(String) }]
    ])('%s', (description, email, password, expected) => {
      const result = adminAuthLogin(email, password);
      expect(result).toStrictEqual(expected);
    });
  });
});

describe('Test that the function works as intended', () => {
  beforeEach(() => {
    clear();
    adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
  });

  test('Verify user details after registration and login', () => {
    const result = adminAuthLogin('email@email.com', 'Password1');
    const details = adminUserDetails(result.userId);
    expect(details).toStrictEqual({
      user: {
        userId: result.userId,
        name: 'first last',
        email: 'email@email.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });
  });

  test('Verify login after password update', () => {
    const register = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

    adminUserPasswordUpdate(registerResult.userId, 'Password1', 'Password2');

    const result = adminAuthLogin('email@email.com', 'Password2');
    expect(result).toStrictEqual({ userId: register.userId });

    const details = adminUserDetails(register.userId);
    expect(details.user.numSuccessfulLogins).toStrictEqual(2);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
  });

  test('Verify failed login attempts', () => {
    const register = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

    const failedLogin = adminAuthLogin('email@email.com', 'WrongPassword');
    expect(failedLogin).toStrictEqual({ error: expect.any(String) });

    const details = adminUserDetails(register.userId);
    expect(details.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
  });
});


