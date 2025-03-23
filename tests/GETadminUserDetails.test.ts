import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  // requestAdminAuthLogin,
  requestGetUserDetails,
  /*
  requestAdminUserPasswordUpdate,
  requestAdminUserDetailsUpdate */
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
// const BADREQUEST = 400;
const UNAUTHORISED = 401;

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

describe('Testing GET /v1/admin/user/details', () => {
  test('Testing the code 200 return value', () => {
    const responseUserDetails = requestGetUserDetails(responseRegister.body.session);
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

      const responseUserDetails = requestGetUserDetails(
        responseRegister.body.session + 'Wrong session'
      );
      expect(responseUserDetails.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUserDetails.statusCode).toStrictEqual(UNAUTHORISED);
    });
  });

  test('Testing GET /v1/admin/user/details works as intended', () => {
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(OK);

    // Check user has correct details
    const responseUserDetails = requestGetUserDetails(responseRegister.body.session);
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
    /*
    // Chage Password
    const requestUpdate = requestAdminUserPasswordUpdate(
      responseRegister.body.session,
      'Password1',
      'Password2'
    );
    expect(requestUpdate.body).toStrictEqual({});
    expect(requestUpdate.statusCode).toStrictEqual(OK);

    // Login with new password
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password2',
    )
    expect(responseLogin2.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(OK);

    // Login with old password
    const responseLogin3 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1',
    )
    expect(responseLogin3.body).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin3.statusCode).toStrictEqual(BADREQUEST);

    // Check user has correct details after password is updated
    const responseUserDetails2 = requestGetUserDetails(responseRegister.body.session);
    expect(responseUserDetails2.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails2.statusCode).toStrictEqual(OK);
*/
    /*
    // change details
    requestAdminUserDetailsUpdate();

    const responseLogin4 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password2',
    )
    expect(responseLogin4.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin4.statusCode).toStrictEqual(OK);

    // Check user has correct details after details are updated
    const responseUserDetails3 = requestGetUserDetails(responseRegister.body.session);
    expect(responseUserDetails3.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails3.statusCode).toStrictEqual(OK);
*/
  });
});
