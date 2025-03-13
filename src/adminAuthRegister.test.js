import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails
} from './auth.js';
import { clear } from './other.js';

beforeEach(() => {
  clear();
});

describe('Test correct return types', () => {
  test('Test if the return is an object and has a userId for normal usage case', () => {
    const result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    expect(typeof result).toBe('object');
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

      expect(result1).toStrictEqual({
        userId: result1.userId
      });
      expect(result2).toStrictEqual({
        userId: result2.userId
      });
    });
  });

  describe('Test valid emails', () => {
    test.each([
      {
        email: 'email@email.com',
        description: 'Standard email format'
      },
      {
        email: 'user.name+some+thing@example.com',
        description: 'Use of spectial characters in username section'
      },
      {
        email: 'user@sub.domain.com',
        description: 'Use of subdomains in domain section'
      }
    ])('Valid email - $description', ({ email, description }) => {
      const result = adminAuthRegister(email, 'Password1', 'first', 'last');
      expect(result).toStrictEqual({
        userId: result.userId
      });
    });

    test.each([
      {
        email: 'emailemail.com',
        description: 'Missing username for domain'
      },
      {
        email: 'invalid-email',
        description: 'Missing domain'
      },
      {
        email: '@missingusername.com',
        description: 'Missing username before domain'
      },
      {
        email: 'user@.com',
        description: 'Missing domain name'
      },
    ])('Invalid email - $description', ({ email, description }) => {
      const result = adminAuthRegister(email, 'Password1', 'first', 'last');

      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('NameFirst test cases', () => {
    test.each([
      {
        nameFirst: 'Fir st',
        description: 'Containing space'
      },
      {
        nameFirst: 'Fir\'st',
        description: 'Containing apostraphe'
      },
      {
        nameFirst: 'Fi -\'St',
        description: 'Containing space, apostraphe and hyphen'
      },
      {
        nameFirst: 'F i -\'S t',
        description: 'Containing multiple spaces with apostraphe and hyphen'
      },
      {
        nameFirst: 'Fi',
        description: 'Containing exactly 2 characters'
      },
      {
        nameFirst: 'Firstfirstfirstfirst',
        description: 'Containing exactly 20 characters'
      }
    ])('Valid first name (containing valid characters) - $description', ({ nameFirst, description }) => {
      const result = adminAuthRegister('email@email.com', 'Password1', nameFirst, 'last');
      expect(result).toStrictEqual({
        userId: result.userId
      });
    });

    test.each([
      {
        nameFirst: 'Fi@ %$/st*',
        description: 'Contains valid and invalid characters'
      },
      {
        nameFirst: '!@#$%%*',
        description: 'Contains only invalid characters'
      },
      {
        nameFirst: 'First123',
        description: 'Contains invalid characters (numbers)'
      },
      {
        nameFirst: 'F',
        description: 'Containing less then 2 characters'
      },
      {
        nameFirst: 'firstfirstfirstfirstfirst',
        description: 'Containing more then 20 characters'
      }
    ])('Invalid first name - $description', ({ nameFirst, description }) => {
      const result = adminAuthRegister('email@email.com', 'Password1', nameFirst, 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('NameLast test cases', () => {
    test.each([
      {
        nameLast: 'La@% $/st',
        description: 'Contains valid and invalid characters'
      },
      {
        nameLast: '!@#$%%*',
        description: 'Contains only invalid characters'
      },
      {
        nameLast: 'Last123',
        description: 'Contains invalid characters (numbers)'
      },
      {
        nameLast: 'L',
        description: 'Containing less then 2 characters'
      },
      {
        nameLast: 'Lastlastlastlastlastlast',
        description: 'Containing more then 20 characters'
      }
    ])('Invalid last name - $description', ({ nameLast, description }) => {
      const result = adminAuthRegister('email@email.com', 'Password1', 'first', nameLast);
      expect(result).toStrictEqual({ error: expect.any(String) });
    });

    test.each([
      {
        nameLast: 'La st',
        description: 'Containing space'
      },
      {
        nameLast: 'La\'st',
        description: 'Containing apostraphe'
      },
      {
        nameLast: 'La-\'St',
        description: 'Containing space, apostraphe and hyphen'
      },
      {
        nameLast: 'L a-\'S t',
        description: 'Containing multiple spaces with apostraphe and hyphen'
      },
      {
        nameLast: 'La',
        description: 'Containing exactly 2 characters'
      },
      {
        nameLast: 'Lastlastlastlast',
        description: 'Containing exactly 20 characters'
      }
    ])('Valid last name (containing valid characters) - $description', ({ nameLast, description }) => {
      const result = adminAuthRegister('email@email.com', 'Password1', 'first', nameLast);
      expect(result).toStrictEqual({ userId: result.userId });
    });
  });

  describe('Password test cases', () => {
    test.each([
      {
        password: 'Password1',
        description: 'Standard password meeting all requirements'
      },
      {
        password: 'testing1',
        description: 'Password meeting requirements at the minimum'
      },
      {
        password: 'qweerty727@#',
        description: 'Password meeting requirements with special characters'
      }
    ])('Valid passowrd - $description', ({ password, description }) => {
      const result = adminAuthRegister('email@email.com', password, 'first', 'last');
      expect(result).toStrictEqual({
        userId: result.userId
      });
    });

    test.each([
      {
        password: 'Passwordpass',
        description: 'Does not contain a number'
      },
      {
        password: '1234567890',
        description: 'Does not contain a letter'
      },
      {
        password: ')@*(#$&@#$&*#*%',
        description: 'Does not contain a number or a letter'
      },
      {
        password: 'P1',
        description: 'Contains less than 8 characters with valid characters'
      },
      {
        password: '*',
        description: 'Contains less than 8 characters with invalid characters'
      }
    ])('Invalid password - $description', ({ password, description }) => {
      const result = adminAuthRegister('email@email.com', password, 'first', 'last');
      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });
});

describe('Test if the function actually works', () => {
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
