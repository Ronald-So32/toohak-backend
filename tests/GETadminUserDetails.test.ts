import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminUserPasswordUpdate,
  requestAdminUserDetailsUpdate,
  OK,
  BADREQUEST,
  UNAUTHORISED
} from './testsHelper';

import { describe } from 'node:test';

let responseRegister: responseInterface;
let session: string;

// Before each test clears the data and registers a user, obtaining the current
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

describe('Testing GET /v1/admin/user/details', () => {
  test('Testing the code 200 return value', () => {
    // Gets user details of current user
    const responseUserDetails = requestGetUserDetails(session);
    // Checks that it returns and user object with the correct user details
    // and that the status code is 200
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

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
      expect(responseRegister.statusCode).toStrictEqual(OK);

      // Gets user details of an invalid session
      const responseUserDetails = requestGetUserDetails(
        session + 'Wrong session'
      );
      // Checks that it returns an error object and that the status code is 401
      expect(responseUserDetails.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUserDetails.statusCode).toStrictEqual(UNAUTHORISED);
    });
  });

  test('Testing GET /v1/admin/user/details works as intended', () => {
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(OK);

    // Check user has correct details
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

    // Change Password
    const requestUpdate = requestAdminUserPasswordUpdate(
      session,
      'Password1',
      'Password2'
    );
    expect(requestUpdate.body).toStrictEqual({});
    expect(requestUpdate.statusCode).toStrictEqual(OK);

    // Login with new password
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password2'
    );
    expect(responseLogin2.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(OK);

    // Login with old password
    const responseLogin3 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    // Checks that logging in with invalid detail returns an error object with
    // the status code 400
    expect(responseLogin3.body).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin3.statusCode).toStrictEqual(BADREQUEST);

    // Check user has correct details after password is updated
    const responseUserDetails2 = requestGetUserDetails(session);
    expect(responseUserDetails2.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 1
      }
    });
    expect(responseUserDetails2.statusCode).toStrictEqual(OK);

    // Change details
    const responseUpdate = requestAdminUserDetailsUpdate(
      session,
      'z7277272@ad.unsw.edu.au',
      'Firsttt',
      'Lasttt'
    );
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(OK);

    const responseLogin4 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password2'
    );
    expect(responseLogin4.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin4.statusCode).toStrictEqual(OK);

    // Check user has correct details after details are updated
    const responseUserDetails3 = requestGetUserDetails(session);
    expect(responseUserDetails3.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Firsttt Lasttt',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails3.statusCode).toStrictEqual(OK);
  });
});
