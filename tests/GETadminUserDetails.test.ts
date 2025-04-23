import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminUserPasswordUpdate,
  requestAdminUserDetailsUpdate
} from './testsHelper';

import {
  ErrorCodes
} from '../src/functionsHelper';

import { describe } from 'node:test';

/**
 * Variable to store the registration response.
 * @type {responseInterface}
 */
let responseRegister: responseInterface;

/**
 * Variable to store the session token.
 * @type {string}
 */
let session: string;

/**
 * Before each test, clear the data store, register a user, and obtain the current session.
 * This ensures each test starts with a clean environment.
 */
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

/**
 * Test suite for the GET /v1/admin/user/details endpoint.
 * This endpoint retrieves all details about the currently logged in user.
 */
describe('Testing GET /v1/admin/user/details', () => {
  /**
   * Test case to verify a successful response with status code 200.
   * When a valid session is provided, the endpoint should return the user's details.
   */
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
    expect(responseUserDetails.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  /**
   * Test suite for error responses from the GET /v1/admin/user/details endpoint.
   */
  describe('Testing for error responses', () => {
    /**
     * Test case to verify that an invalid session token results in a 401 Unauthorized error.
     */
    test('Testing when the session is invalid', () => {
      expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
      expect(responseRegister.statusCode).toStrictEqual(ErrorCodes.OK);

      // Gets user details of an invalid session
      const responseUserDetails = requestGetUserDetails(
        session + 'Wrong session'
      );
      // Checks that it returns an error object and that the status code is 401
      expect(responseUserDetails.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUserDetails.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
    });
  });

  /**
   * Comprehensive test case that verifies the user details endpoint works as intended through
   * multiple operations (password updates, logins, and detail updates).
   */
  test('Testing GET /v1/admin/user/details works as intended', () => {
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(ErrorCodes.OK);

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
    expect(responseUserDetails.statusCode).toStrictEqual(ErrorCodes.OK);

    // Change Password
    const requestUpdate = requestAdminUserPasswordUpdate(
      session,
      'Password1',
      'Password2'
    );
    expect(requestUpdate.body).toStrictEqual({});
    expect(requestUpdate.statusCode).toStrictEqual(ErrorCodes.OK);

    // Login with new password
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password2'
    );
    expect(responseLogin2.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(ErrorCodes.OK);

    // Login with old password
    const responseLogin3 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    // Checks that logging in with invalid detail returns an error object with
    // the status code 400
    expect(responseLogin3.body).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin3.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

    // Check user has correct details after password is updated
    // Note that successful logins increased and failed passwords since last login is recorded
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
    expect(responseUserDetails2.statusCode).toStrictEqual(ErrorCodes.OK);

    // Change details - updating first and last name
    const responseUpdate = requestAdminUserDetailsUpdate(
      session,
      'z7277272@ad.unsw.edu.au',
      'Firsttt',
      'Lasttt'
    );
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.OK);

    // Login again with the new password to verify credentials still work
    const responseLogin4 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password2'
    );
    expect(responseLogin4.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin4.statusCode).toStrictEqual(ErrorCodes.OK);

    // Check user has correct details after details are updated
    // Note that successful logins increased and failed passwords was reset
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
    expect(responseUserDetails3.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});