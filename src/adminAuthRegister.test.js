import { adminAuthRegister, adminAuthLogin, adminUserDetails } from './auth.js';
import { clear } from './other.js';

describe('Test correct return types', () => {
  beforeEach(() => {
    clear();
  });

  test('Test if the return is an object', () => {
    const result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

  test('Test if the return object has a userId', () => {
    const result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    expect(result).toStrictEqual({
      userId: expect.any(Number)
    });
    expect(result).not.toBeNull();
  });
});

describe('Test error cases', () => {
  beforeEach(() => {
    clear();
  });

  describe('Test if the email is already used by another user', () => {
    test('Email is already used', () => {
      adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      const result = adminAuthRegister('email@email.com', 'Password2', 'first', 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('Email is not used', () => {
      const result1 = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      const result2 = adminAuthRegister('email2@email.com', 'Password2', 'firstt', 'lastt');
      expect(result1).toStrictEqual({ userId: expect.any(Number) });
      expect(result2).toStrictEqual({ userId: expect.any(Number) });
    });
  });

  describe('Test valid emails', () => {
    test.each([
      ['Valid email 1', 'email@email.com'],
      ['Valid email 2', 'user.name+some+thing@example.com'],
      ['Valid email 3', 'user@sub.domain.com']
    ])('%s', (description, email) => {
      const result = adminAuthRegister(email, 'Password1', 'first', 'last');
      expect(result).toStrictEqual({ userId: expect.any(Number) });
    });

    test.each([
      ['Invalid email 1', 'emailemail.com'],
      ['Invalid email 2', 'invalid-email'],
      ['Invalid email 3', '@missingusername.com'],
      ['Invalid email 4', 'user@.com']
    ])('%s', (description, email) => {
      const result = adminAuthRegister(email, 'Password1', 'first', 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('NameFirst test cases', () => {
    test.each([
      ['Valid characters 1', 'first'],
      ['Valid characters 2', 'FIRST'],
      ['Valid characters 3', 'fir_st'],
      ['Valid characters 4', 'fir st'],
      ['Valid characters 5', 'fir\'st'],
      ['Valid characters 6', 'Fi _r\'St']
    ])('%s', (description, nameFirst) => {
      const result = adminAuthRegister('email@email.com', 'Password1', nameFirst, 'last');
      expect(result).toStrictEqual({ userId: expect.any(Number) });
    });

    test.each([
      ['Invalid characters 1', 'fi$#rst'],
      ['Invalid characters 2', 'fi@%$/*rst'],
      ['Invalid characters 3', '!@#$%%*']
    ])('%s', (description, nameFirst) => {
      const result = adminAuthRegister('email@email.com', 'Password1', nameFirst, 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('Contains less than 2 characters', () => {
      const result = adminAuthRegister('email@email.com', 'Password1', 'f', 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('Contains more than 20 characters', () => {
      const result = adminAuthRegister('email@email.com', 'Password1', 'firstfirstfirstfirstfirstfirst', 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('NameLast test cases', () => {
    test.each([
      ['Valid characters 1', 'last'],
      ['Valid characters 2', 'LAST'],
      ['Valid characters 3', 'la_st'],
      ['Valid characters 4', 'la st'],
      ['Valid characters 5', 'la\'st'],
      ['Valid characters 6', 'L\'a_S t']
    ])('%s', (description, nameLast) => {
      const result = adminAuthRegister('email@email.com', 'Password1', 'first', nameLast);
      expect(result).toStrictEqual({ userId: expect.any(Number) });
    });

    test.each([
      ['Invalid characters 1', 'las*/t'],
      ['Invalid characters 2', 'la@st'],
      ['Invalid characters 3', '*/-%$#']
    ])('%s', (description, nameLast) => {
      const result = adminAuthRegister('email@email.com', 'Password1', 'first', nameLast);
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('Contains less than 2 characters', () => {
      const result = adminAuthRegister('email@email.com', 'Password1', 'first', 'l');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('Contains more than 20 characters', () => {
      const result = adminAuthRegister('email@email.com', 'Password1', 'first', 'lastlastlastlastlastlastlastlastlastlastlastlast');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Password test cases', () => {
    test.each([
      ['Valid password 1', 'Password1'],
      ['Valid password 2', 'Testing123'],
      ['Valid password 3', 'qweerty727@#']
    ])('%s', (description, password) => {
      const result = adminAuthRegister('email@email.com', password, 'first', 'last');
      expect(result).toStrictEqual({ userId: expect.any(Number) });
    });

    test.each([
      ['Invalid password 1', 'Passwordpass'],
      ['Invalid password 2', '1234567890'],
      ['Invalid password 3', ')@*(#$&@#$&*#*%']
    ])('%s', (description, password) => {
      const result = adminAuthRegister('email@email.com', password, 'first', 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('Contains less than 8 characters with valid characters', () => {
      const result = adminAuthRegister('email@email.com', 'P1', 'first', 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test('Contains less than 8 characters with invalid characters', () => {
      const result = adminAuthRegister('email@email.com', '*', 'first', 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });
});

describe('Check normal usage cases', () => {
  beforeEach(() => {
    clear();
  });

  test('Normal case 1', () => {
    const result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    expect(result).toStrictEqual({ userId: expect.any(Number) });
  });
});

describe('Test if the function actually works', () => {
  beforeEach(() => {
    clear();
  });

  test('Test user details after registration', () => {
    const result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    const details = adminUserDetails(result.userId);
    const login = adminAuthLogin('email@email.com', 'Password1');

    expect(details).toStrictEqual({
      user: {
        userId: result.userId,
        name: 'first last',
        email: 'email@email.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    });

    expect(login).toStrictEqual({ userId: result.userId });
  });
});

