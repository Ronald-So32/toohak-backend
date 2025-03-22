import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
/*  requestAdminQuizCreate,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestGetQuizList */
} from './testsHelper';

import { describe } from 'node:test';

let responseRegister: responseInterface;

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
});

describe('Testing POST /v1/admin/auth/register', () => {
  test('Testing the return value', () => {
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(200);
  });

  describe('Testing for error responses', () => {
    describe('Testing the email', () => {
      test('Email has already been used', () => {
        responseRegister = requestAdminAuthRegister(
          'z7277272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        );
        expect(responseRegister.body).toStrictEqual({ error: expect.any(String) });
        expect(responseRegister.statusCode).toStrictEqual(400);
      });

      test('Email has not been used', () => {
        responseRegister = requestAdminAuthRegister(
          'z6969420@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        );
        expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
        expect(responseRegister.statusCode).toStrictEqual(200);
      });

      describe('Valid cases', () => {
      
      });

      describe('Invalid cases', () => {
      
      });
    });

    describe('Testing first name', () => {
      describe('Valid cases', () => {
        test.each([
          {
            description: 'Standard first name',
            firstName: 'First',
            expected: { session: expect.any(String) },
            statusCode: 200,
          },
          {
            description: 'First name with space',
            firstName: 'Fi rst',
            expected: { session: expect.any(String) },
            statusCode: 200,
          },
          {
            description: 'First name with apostrophe',
            firstName: "Fi'rst",
            expected: { session: expect.any(String) },
            statusCode: 200,
          },
          {
            description: 'First name with hyphen',
            firstName: 'Fi-rst',
            expected: { session: expect.any(String) },
            statusCode: 200,
          },
          {
            description: 'First containing space, apostraphe and hyphen',
            firstName: "Fi -'St",
            expected: { session: expect.any(String) },
            statusCode: 200,
          },
          {
            description: 'First containing multiple spaces with apostraphe and hyphen',
            firstName: "F i -'S t",
            expected: { session: expect.any(String) },
            statusCode: 200,
          },
          {
            description: 'First name with exactly 2 characters',
            firstName: 'Fi',
            expected: { session: expect.any(String) },
            statusCode: 200,
          },
          {
            description: 'First name with exactly 20 characters',
            firstName: 'Firstfirstfirstfirst',
            expected: { session: expect.any(String) },
            statusCode: 200,
          },
        ])('$description', ({ firstName, expected, statusCode }) => {
          const responseRegister = requestAdminAuthRegister(
            'z6969420@ad.unsw.edu.au',
            'Password1',
            firstName,
            'Last'
          );
          expect(responseRegister.body).toStrictEqual(expected);
          expect(responseRegister.statusCode).toStrictEqual(statusCode);
        });
      });

      describe('Invalid cases', () => {
        test.each([
          {
            description: 'First name with valid and invalid characters',
            firstName: 'Fi@%$/st*',
            expected: { error: expect.any(String) },
            statusCode: 400,
          },
          {
            description: 'First name with only invalid characters',
            firstName: '!@#$%%*',
            expected: { error: expect.any(String) },
            statusCode: 400,
          },
          {
            description: 'First name with numbers',
            firstName: 'First123',
            expected: { error: expect.any(String) },
            statusCode: 400,
          },
          {
            description: 'First name with less than 2 characters',
            firstName: 'F',
            expected: { error: expect.any(String) },
            statusCode: 400,
          },
          {
            description: 'First name with more than 20 characters',
            firstName: 'Firstfirstfirstfirstfirstfirst',
            expected: { error: expect.any(String) },
            statusCode: 400,
          },
        ])('$description', ({ firstName, expected, statusCode }) => {
          const responseRegister = requestAdminAuthRegister(
            'z7277272@ad.unsw.edu.au',
            'Password1',
            firstName,
            'Last'
          );
          expect(responseRegister.body).toStrictEqual(expected);
          expect(responseRegister.statusCode).toStrictEqual(statusCode);
        });
      });
    });

    describe('Testing last name', () => {
      describe('Valid cases', () => {
      
      });

      describe('Invalid cases', () => {
      
      });
    });

    describe('Testing the password', () => {
      describe('Valid cases', () => {
      
      });

      describe('Invalid cases', () => {
      
      });
    });
  });
/*
  describe('Testing POST /v1/admin/auth/register works as intended', () => {
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(200);
    
    // Check user can login
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin).toStrictEqual({ session: responseRegister.body.session });
    expect(responseLogin.statusCode).toStrictEqual(200);

    // Check user has correct details
    const responseUserDetails = requestGetUserDetails(responseRegister.body.session);
    expect(responseUserDetails).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails.statusCode).toStrictEqual(200);
  });
*/
});
