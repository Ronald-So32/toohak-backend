import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestGetQuizList,
  requestAdminAuthLogout
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;

let session: string;

// Clears the data before each test
beforeEach(() => {
  requestClear();
});

describe('Testing POST /v1/admin/auth/register', () => {
  test('Testing the code 200 return value', () => {
    // To register a user
    const responseRegister = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    // Checks that a session object is returned and that the status code is 200
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing the email', () => {
      test('Email has already been used', () => {
        let responseRegister = requestAdminAuthRegister(
          'z7277272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        );
        expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
        expect(responseRegister.statusCode).toStrictEqual(OK);

        responseRegister = requestAdminAuthRegister(
          'z7277272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        );
        // Checks that an error object is returned and that the status code is 400
        expect(responseRegister.body).toStrictEqual({ error: expect.any(String) });
        expect(responseRegister.statusCode).toStrictEqual(BADREQUEST);
      });

      test('Email has not been used', () => {
        const responseRegister = requestAdminAuthRegister(
          'z6969420@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        );
        expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
        expect(responseRegister.statusCode).toStrictEqual(OK);
      });

      describe('Valid cases', () => {
        test.each([
          {
            description: 'Standard first name',
            email: 'email1@email.com',
          },
          {
            description: 'Use of spectial characters in username section',
            email: 'user.name+some+thing@example.com',
          },
          {
            description: 'Use of subdomains in domain section',
            email: 'user@sub.domain.com',
          },
        ])('$description', ({ email }) => {
          const responseRegister = requestAdminAuthRegister(
            email,
            'Password1',
            'First',
            'Last'
          );
          expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
          expect(responseRegister.statusCode).toStrictEqual(OK);
        });
      });

      describe('Invalid cases', () => {
        test.each([
          {
            description: 'Missing username for domain',
            email: 'emailemail.com',
          },
          {
            description: 'Missing domain',
            email: 'invalid-email',
          },
          {
            description: 'Missing username before domain',
            email: '@missingusername.com',
          },
          {
            description: 'Missing domain name',
            email: 'user@.com',
          },
        ])('$description', ({ email }) => {
          const responseRegister = requestAdminAuthRegister(
            email,
            'Password1',
            'First',
            'Last'
          );
          expect(responseRegister.body).toStrictEqual({ error: expect.any(String) });
          expect(responseRegister.statusCode).toStrictEqual(BADREQUEST);
        });
      });
    });

    describe('Testing first name', () => {
      describe('Valid cases', () => {
        test.each([
          {
            description: 'Standard first name',
            firstName: 'First',
          },
          {
            description: 'First name with space',
            firstName: 'Fi rst',
          },
          {
            description: 'First name with apostrophe',
            firstName: "Fi'rst",
          },
          {
            description: 'First name with hyphen',
            firstName: 'Fi-rst',
          },
          {
            description: 'First containing space, apostraphe and hyphen',
            firstName: "Fi -'St",
          },
          {
            description: 'First containing multiple spaces with apostraphe and hyphen',
            firstName: "F i -'S t",
          },
          {
            description: 'First name with exactly 2 characters',
            firstName: 'Fi',
          },
          {
            description: 'First name with exactly 20 characters',
            firstName: 'Firstfirstfirstfirst',
          },
        ])('$description', ({ firstName }) => {
          const responseRegister = requestAdminAuthRegister(
            'z6969420@ad.unsw.edu.au',
            'Password1',
            firstName,
            'Last'
          );
          expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
          expect(responseRegister.statusCode).toStrictEqual(OK);
        });
      });

      describe('Invalid cases', () => {
        test.each([
          {
            description: 'First name with valid and invalid characters',
            firstName: 'Fi@%$/st*',
          },
          {
            description: 'First name with only invalid characters',
            firstName: '!@#$%%*',
          },
          {
            description: 'First name with numbers',
            firstName: 'First123',
          },
          {
            description: 'First name with less than 2 characters',
            firstName: 'F',
          },
          {
            description: 'First name with more than 20 characters',
            firstName: 'Firstfirstfirstfirstfirstfirst',
          },
        ])('$description', ({ firstName }) => {
          const responseRegister = requestAdminAuthRegister(
            'z7277272@ad.unsw.edu.au',
            'Password1',
            firstName,
            'Last'
          );
          expect(responseRegister.body).toStrictEqual({ error: expect.any(String) });
          expect(responseRegister.statusCode).toStrictEqual(BADREQUEST);
        });
      });
    });

    describe('Testing last name', () => {
      describe('Valid cases', () => {
        test.each([
          {
            description: 'Standard last name',
            nameLast: 'Last',
          },
          {
            description: 'last name with hyphen',
            nameLast: 'La-st',
          },
          {
            nameLast: 'La st',
            description: 'Containing space'
          },
          {
            nameLast: "La'st",
            description: 'Containing apostraphe'
          },
          {
            nameLast: "La-'St",
            description: 'Containing space, apostraphe and hyphen'
          },
          {
            nameLast: "L a-'S t",
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
        ])('$description', ({ nameLast }) => {
          const responseRegister = requestAdminAuthRegister(
            'z6969420@ad.unsw.edu.au',
            'Password1',
            'First',
            nameLast
          );
          expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
          expect(responseRegister.statusCode).toStrictEqual(OK);
        });
      });

      describe('Invalid cases', () => {
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
            nameLast: 'Lastlastlastlastlastlastlast',
            description: 'Containing more then 20 characters'
          }
        ])('$description', ({ nameLast }) => {
          const responseRegister = requestAdminAuthRegister(
            'z7277272@ad.unsw.edu.au',
            'Password1',
            'First',
            nameLast
          );
          expect(responseRegister.body).toStrictEqual({ error: expect.any(String) });
          expect(responseRegister.statusCode).toStrictEqual(BADREQUEST);
        });
      });
    });

    describe('Testing the password', () => {
      describe('Valid cases', () => {
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
        ])('$description', ({ password }) => {
          const responseRegister = requestAdminAuthRegister(
            'z7277272@ad.unsw.edu.au',
            password,
            'First',
            'Last'
          );
          expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
          expect(responseRegister.statusCode).toStrictEqual(OK);
        });
      });

      describe('Invalid cases', () => {
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
        ])('$description', ({ password }) => {
          const responseRegister = requestAdminAuthRegister(
            'z7277272@ad.unsw.edu.au',
            password,
            'First',
            'Last'
          );
          expect(responseRegister.body).toStrictEqual({ error: expect.any(String) });
          expect(responseRegister.statusCode).toStrictEqual(BADREQUEST);
        });
      });
    });
  });

  test('Testing POST /v1/admin/auth/register works as intended', () => {
    const responseRegister = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    session = responseRegister.body.session;
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(OK);

    // Check user can log out
    const responseLogout = requestAdminAuthLogout(session);
    expect(responseLogout.body).toStrictEqual({});
    expect(responseLogout.statusCode).toStrictEqual(OK);

    // Check user can log back in
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin.body).toStrictEqual({ session: responseLogin.body.session });
    expect(responseLogin.statusCode).toStrictEqual(OK);
    session = responseLogin.body.session;

    // Check user has correct details
    const responseUserDetails = requestGetUserDetails(session);
    expect(responseUserDetails.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails.statusCode).toStrictEqual(OK);

    // Check that user has no quiz created
    const responseQuizList = requestGetQuizList(session);
    expect(responseQuizList.body).toStrictEqual({ quizzes: [] });
    expect(responseQuizList.statusCode).toStrictEqual(OK);
  });
});
