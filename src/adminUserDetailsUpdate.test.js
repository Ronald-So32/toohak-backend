import { adminUserDetailsUpdate, adminUserDetails } from './auth.js';
import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

let id;

beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
});

describe('Test correct return type and normal case usage', () => {
  test.each([
    {
      email: 'email@email.com',
      nameFirst: 'First',
      nameLast: 'Last',
      description: 'No changes made to user\'s details'
    },
    {
      email: 'Email2@email.com',
      nameFirst: 'First',
      nameLast: 'Last',
      description: 'Changes made to user\'s email'
    },
    {
      email: 'email@email.com',
      nameFirst: 'Second',
      nameLast: 'Last',
      description: 'Changes made to user\'s first name'
    },
    {
      email: 'email@email.com',
      nameFirst: 'First',
      nameLast: 'SecondLast',
      description: 'Changes made to user\'s last name'
    },
    {
      email: 'Email@email.com',
      nameFirst: 'Second',
      nameLast: 'Last',
      description: 'Changes made to user\'s email and first name'
    },
    {
      email: 'Email@email.com',
      nameFirst: 'First',
      nameLast: 'SecondLast',
      description: 'Changes made to user\'s email and last name'
    },
    {
      email: 'email@email.com',
      nameFirst: 'Second',
      nameLast: 'SecondLast',
      description: 'Changes made to user\'s first and last name'
    },
    {
      email: 'Email@email.com',
      nameFirst: 'Second',
      nameLast: 'SecondLast',
      description: 'Changes made to all of user\'s details'
    },
  ])('Valid return types and normal case usage - %s', ({ email, nameFirst, nameLast, description }) => {
    const result = adminUserDetailsUpdate(id, email, nameFirst, nameLast);

    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({});
    expect(result).not.toBeNull();

    // To make sure taht the details are updated
    expect(typeof adminUserDetails(id));
    expect(adminUserDetails(id)).toStrictEqual({
      user: {
        userId: id,
        name: nameFirst + ' ' + nameLast,
        email: email,
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      },
    });
    expect(adminUserDetails(id)).not.toBeNull();
  });
});

describe('Test error cases', () => {
  test('Invalid userId - When id doens\'t exist', () => {
    const result = adminUserDetailsUpdate(id + 999, 'email@email.com', 'First', 'Last');
    expect(result).toStrictEqual({ error: expect.any(String) });

    // To make sure that it doesn't update the existing user
    expect(typeof adminUserDetails(id));
    expect(adminUserDetails(id)).toStrictEqual({
      user: {
        userId: id,
        name: 'First Last',
        email: 'email@email.com',
        numSuccessfulLogins: expect.any(Number),
        numFailedPasswordsSinceLastLogin: expect.any(Number),
      },
    });
    expect(adminUserDetails(id)).not.toBeNull();
  });

  describe('Test validity of emails', () => {
    test('Invalid email - Email already in use', () => {
      const id2 = adminAuthRegister('email2@email.com', 'Password1', 'First', 'Last').userId;
      const result1 = adminUserDetailsUpdate(id, 'email1@email.com', 'First', 'Last');

      expect(typeof result1).toBe('object');
      expect(result1).toStrictEqual({});
      expect(result1).not.toBeNull();

      const result2 = adminUserDetailsUpdate(id, 'email2@email.com', 'First', 'Last');
      expect(result2).toMatchObject({ error: expect.any(String) });

      // To make sure that the email is not updated
      expect(typeof adminUserDetails(id));
      expect(adminUserDetails(id)).toStrictEqual({
        user: {
          userId: id,
          name: 'First Last',
          email: 'email1@email.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        },
      });
      expect(adminUserDetails(id)).not.toBeNull();
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
    ])('Invalid email format - $description', ({ email, description }) => {
      const result = adminUserDetailsUpdate(id, email, 'First', 'Last');
      expect(result).toEqual({ error: expect.any(String) });

      // To make sure that the email is not updated
      expect(typeof adminUserDetails(id));
      expect(adminUserDetails(id)).toStrictEqual({
        user: {
          userId: id,
          name: 'First Last',
          email: 'email@email.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        },
      });
      expect(adminUserDetails(id)).not.toBeNull();
    });
  });

  describe('Test validity of first names', () => {
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
    ])('Invalid first name - $description', ({ nameFirst, description }) => {
      const result = adminUserDetailsUpdate(id, 'email@email.com', nameFirst, 'Last');
      expect(result).toEqual({ error: expect.any(String) });

      // To make sure that the first name is not updated
      expect(typeof adminUserDetails(id));
      expect(adminUserDetails(id)).toStrictEqual({
        user: {
          userId: id,
          name: 'First Last',
          email: 'email@email.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        },
      });
      expect(adminUserDetails(id)).not.toBeNull();
    });

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
    ])('Valid first name (containing valid characters) - $description', ({ nameFirst, description }) => {
      const result = adminUserDetailsUpdate(id, 'email@email.com', nameFirst, 'Last');

      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({});
      expect(result).not.toBeNull();

      // To make sure that the first name is updated
      expect(typeof adminUserDetails(id));
      expect(adminUserDetails(id)).toStrictEqual({
        user: {
          userId: id,
          name: nameFirst + ' Last',
          email: 'email@email.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        },
      });
      expect(adminUserDetails(id)).not.toBeNull();
    });

    test.each([
      {
        nameFirst: 'F',
        description: 'Containing less then 2 characters'
      },
      {
        nameFirst: 'firstfirstfirstfirstfirst',
        description: 'Containing more then 20 characters'
      }
    ])('Invalid first name - $description', ({ nameFirst, description }) => {
      const result = adminUserDetailsUpdate(id, 'email@email.com', nameFirst, 'Last');

      expect(result).toStrictEqual({ error: expect.any(String) });
      // To make sure that the first name is not updated
      expect(typeof adminUserDetails(id));
      expect(adminUserDetails(id)).toStrictEqual({
        user: {
          userId: id,
          name: 'First Last',
          email: 'email@email.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        },
      });
      expect(adminUserDetails(id)).not.toBeNull();
    });

    test.each([
      {
        nameFirst: 'Fi',
        description: 'Containing exactly 2 characters'
      },
      {
        nameFirst: 'Firstfirstfirstfirst',
        description: 'Containing exactly 20 characters'
      }
    ])('Valid first name - $description', ({ nameFirst, description }) => {
      const result = adminUserDetailsUpdate(id, 'email@email.com', nameFirst, 'Last');

      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({});
      expect(result).not.toBeNull();

      // To make sure that the first name is not updated
      expect(typeof adminUserDetails(id));
      expect(adminUserDetails(id)).toStrictEqual({
        user: {
          userId: id,
          name: nameFirst + ' Last',
          email: 'email@email.com',
          numSuccessfulLogins: expect.any(Number),
          numFailedPasswordsSinceLastLogin: expect.any(Number),
        },
      });
      expect(adminUserDetails(id)).not.toBeNull();
    });

    describe('Test validity of last names', () => {
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
      ])('Invalid last name (containing invalid characters) - $description', ({ nameLast, description }) => {
        const result = adminUserDetailsUpdate(id, 'email@email.com', 'First', nameLast);
        expect(result).toMatchObject({ error: expect.any(String) });

        // To make sure that the last name is not updated
        expect(typeof adminUserDetails(id));
        expect(adminUserDetails(id)).toStrictEqual({
          user: {
            userId: id,
            name: 'First Last',
            email: 'email@email.com',
            numSuccessfulLogins: expect.any(Number),
            numFailedPasswordsSinceLastLogin: expect.any(Number),
          },
        });
        expect(adminUserDetails(id)).not.toBeNull();
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
      ])('Valid last name (containing valid characters) - $description', ({ nameLast, description }) => {
        const result = adminUserDetailsUpdate(id, 'email@email.com', 'First', nameLast);

        expect(typeof result).toBe('object');
        expect(result).toStrictEqual({});
        expect(result).not.toBeNull();

        // To make sure that the last name is updated
        expect(typeof adminUserDetails(id));
        expect(adminUserDetails(id)).toStrictEqual({
          user: {
            userId: id,
            name: 'First ' + nameLast,
            email: 'email@email.com',
            numSuccessfulLogins: expect.any(Number),
            numFailedPasswordsSinceLastLogin: expect.any(Number),
          },
        });
        expect(adminUserDetails(id)).not.toBeNull();
      });

      test.each([
        {
          nameLast: 'L',
          description: 'Containing less then 2 characters'
        },
        {
          nameLast: 'fLastlastlastlastlastlast',
          description: 'Containing more then 20 characters'
        }
      ])('Invalid last name - $description', ({ nameLast, description }) => {
        const result = adminUserDetailsUpdate(id, 'email@email.com', 'First', nameLast);

        expect(result).toStrictEqual({ error: expect.any(String) });
        // To make sure that the first name is not updated
        expect(typeof adminUserDetails(id));
        expect(adminUserDetails(id)).toStrictEqual({
          user: {
            userId: id,
            name: 'First Last',
            email: 'email@email.com',
            numSuccessfulLogins: expect.any(Number),
            numFailedPasswordsSinceLastLogin: expect.any(Number),
          },
        });
        expect(adminUserDetails(id)).not.toBeNull();
      });

      test.each([
        {
          nameLast: 'La',
          description: 'Containing exactly 2 characters'
        },
        {
          nameLast: 'Lastlastlastlastlast',
          description: 'Containing exactly 20 characters'
        }
      ])('Valid last name - $description', ({ nameLast, description }) => {
        const result = adminUserDetailsUpdate(id, 'email@email.com', 'First', nameLast);

        expect(typeof result).toBe('object');
        expect(result).toStrictEqual({});
        expect(result).not.toBeNull();

        // To make sure that the first name is not updated
        expect(typeof adminUserDetails(id));
        expect(adminUserDetails(id)).toStrictEqual({
          user: {
            userId: id,
            name: 'First ' + nameLast,
            email: 'email@email.com',
            numSuccessfulLogins: expect.any(Number),
            numFailedPasswordsSinceLastLogin: expect.any(Number),
          },
        });
        expect(adminUserDetails(id)).not.toBeNull();
      });
    });
  });
});
