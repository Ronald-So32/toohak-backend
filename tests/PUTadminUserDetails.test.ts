import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminUserDetailsUpdate,
  // requestAdminUserPasswordUpdate
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
// let responseDetails: responseInterface;
let session: string;

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
});

describe('Testing PUT /v1/admin/user/details', () => {
  test('Testing the code 200 return value', () => {
    const responseUpdate = requestAdminUserDetailsUpdate(
      session,
      'z69727@ad.unsw.edu.au',
      'Firsttt',
      'Lasttt'
    );
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing the email', () => {
      test('Email is already used by another user', () => {
        requestAdminAuthRegister(
          'another@email.com',
          'Password1',
          'AnotherFirst',
          'AnotherLast'
        );

        // Try to update the first user's email to the second user's email
        const responseUpdate = requestAdminUserDetailsUpdate(
          session,
          'another@email.com',
          'First',
          'Last'
        );
        expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdate.statusCode).toStrictEqual(BADREQUEST);
      });

      test('Invalid email format', () => {
        const responseUpdate = requestAdminUserDetailsUpdate(
          session,
          'invalid-email',
          'First',
          'Last'
        );
        expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdate.statusCode).toStrictEqual(BADREQUEST);

        const responseUserDetails = requestGetUserDetails(session);
        expect(responseUserDetails.body).toStrictEqual({
          user: {
            userId: expect.any(Number),
            name: 'First Last',
            email: 'z7277272@ad.unsw.edu.au',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          }
        });
        expect(responseUserDetails.statusCode).toStrictEqual(OK);
      });

      test('Valid email format', () => {
        const responseUpdate = requestAdminUserDetailsUpdate(
          session,
          'valid@email.com',
          'First',
          'Last'
        );
        expect(responseUpdate.body).toStrictEqual({});
        expect(responseUpdate.statusCode).toStrictEqual(OK);

        const responseUserDetails = requestGetUserDetails(session);
        expect(responseUserDetails.body).toStrictEqual({
          user: {
            userId: expect.any(Number),
            name: 'First Last',
            email: 'valid@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          }
        });
        expect(responseUserDetails.statusCode).toStrictEqual(OK);
      });
    });
      
    describe('Testing the password', () => {
    
    });
    
    describe('Testing the first name', () => {
    
    });
    
    describe('Testing the last name', () => {
    
    });
  });

  test('Testing PUT /v1/admin/user/details works as intended', () => {
    // testing valid cases
  });

});
