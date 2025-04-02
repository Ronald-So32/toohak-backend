import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminUserPasswordUpdate,
  requestAdminAuthLogout 
} from '.testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;

let responseRegister: responseInterface;
let responseDetails: responseInterface;
let session: string;

// Before each test clears the datas then registers a user, it's current
// session and user details
beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  responseDetails = requestGetUserDetails(session);
});

describe('Testing POST /v1/admin/auth/login', () => {
  test('Testing the code 200 return value', () => {
    // Logs in the user
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    // Checks that logging in returns the current session and has a status code of 200
    expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin.statusCode).toStrictEqual(OK);

    // Retrieves the new user details checking that the number of successful logins is
    // 1 more then last login
    const responseDetailsNew = requestGetUserDetails(session);
    expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
      responseDetails.body.user.numSuccessfulLogins + 1
    );
    expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
      responseDetails.body.user.numFailedPasswordsSinceLastLogin
    );
  });

  describe('Testing for error responses', () => {
    describe('Testing the email', () => {
      test('Testing when the email does exist', () => {
        const responseLogin = requestAdminAuthLogin(
          'z7277272@ad.unsw.edu.au',
          'Password1'
        );
        expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(OK);

        const responseDetailsNew = requestGetUserDetails(session);
        expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
          responseDetails.body.user.numSuccessfulLogins + 1
        );
        expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
          responseDetails.body.user.numFailedPasswordsSinceLastLogin
        );
      });

      test('Testing when the email does not exist', () => {
        const responseLogin = requestAdminAuthLogin(
          'z696969@ad.unsw.edu.au',
          'Password1'
        );
        // Checks that the login attempt fails, returning an error object and has a status code of 400
        expect(responseLogin.body).toStrictEqual({ error: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(BADREQUEST);

        const responseDetailsNew = requestGetUserDetails(session);
        expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
          responseDetails.body.user.numSuccessfulLogins
        );
        expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
          responseDetails.body.user.numFailedPasswordsSinceLastLogin
        );
      });
    });

    describe('Testing the password', () => {
      test('Testing when the password is correct', () => {
        const responseLogin = requestAdminAuthLogin(
          'z7277272@ad.unsw.edu.au',
          'Password1'
        );
        expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(OK);

        const responseDetailsNew = requestGetUserDetails(session);
        expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
          responseDetails.body.user.numSuccessfulLogins + 1
        );
        expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
          responseDetails.body.user.numFailedPasswordsSinceLastLogin
        );
      });

      test('Testing when the password is wrong', () => {
        const responseLogin = requestAdminAuthLogin(
          'z7277272@ad.unsw.edu.au',
          'Password22'
        );
        expect(responseLogin.body).toStrictEqual({ error: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(BADREQUEST);

        const responseDetailsNew = requestGetUserDetails(session);
        expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
          responseDetails.body.user.numSuccessfulLogins
        );
        expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
          responseDetails.body.user.numFailedPasswordsSinceLastLogin + 1
        );
      });
    });
  });

  test('Testing POST /v1/admin/auth/login works as intended', () => {
    expect(responseDetails.body.user.numSuccessfulLogins).toStrictEqual(1);
    expect(responseDetails.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

     // Check user can log out
     const responseLogout = requestAdminAuthLogout(session)
     expect(responseLogout.body).toStrictEqual({});
     expect(responseLogout.statusCode).toStrictEqual(OK);

    // Can log back in
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin.statusCode).toStrictEqual(OK);

    // Updates the current password
    const requestUpdate = requestAdminUserPasswordUpdate(
      session,
      'Password1',
      'Password2'
    );
    expect(requestUpdate.body).toStrictEqual({});
    expect(requestUpdate.statusCode).toStrictEqual(OK);

    // Check if user can still login after password update
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password2'
    );
    expect(responseLogin2.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(OK);

    // Make sure the old password doesn't work
    const responseLogin3 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin3.body).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin3.statusCode).toStrictEqual(BADREQUEST);

    const responseDetailsNew = requestGetUserDetails(session);
    expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
      responseDetails.body.user.numSuccessfulLogins + 2
    );
    expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
      responseDetails.body.user.numFailedPasswordsSinceLastLogin + 1
    );
  });
});
