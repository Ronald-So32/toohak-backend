import { adminAuthLogin, adminAuthRegister } from './auth.js';
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
    expect(result).toEqual({
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
      expect(result).toMatchObject(expected);
    });
  });

  describe('Test if the password is correct', () => {
    test.each([
      ['Password is correct', 'email@email.com', 'Password1', { userId: expect.any(Number) }],
      ['Password is incorrect', 'email@email.com', 'Password2', { error: expect.any(String) }]
    ])('%s', (description, email, password, expected) => {
      const result = adminAuthLogin(email, password);
      expect(result).toMatchObject(expected);
    });
  });
});

describe('Check normal usage cases', () => {
  beforeEach(() => {
    clear();
    adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
  });

  test('Normal case 1', () => {
    const result = adminAuthLogin('email@email.com', 'Password1');
    expect(typeof result).toBe('object');
    expect(result).toEqual({
      userId: expect.any(Number)
    });
    expect(result).not.toBeNull();
  });
});



