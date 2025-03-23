import {
  requestClear,
  // requestAdminAuthRegister,
  // responseInterface,
  requestAdminAuthLogin,
/*  requestGetUserDetails,
  requestGetUserDetails,
  requestAdminUserPasswordUpdate */
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
// const BADREQUEST = 400;

// let responseRegister: responseInterface;
// let responseDetails: responseInterface;

beforeEach(() => {
  requestClear();
/*  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
*/
  // responseDetails = requestGetUserDetails(responseRegister.body.session);
});

describe('Testing POST /v1/admin/auth/register', () => {
  test('Testing the code 200 return value', () => {
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin.statusCode).toStrictEqual(OK);
    /*
    const responseDetailsNew = requestGetUserDetails(responseRegister.body.session);
    expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
      responseDetails.body.user.numSuccessfulLogins + 1
    );
    expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
      responseDetails.body.user.numFailedPasswordsSinceLastLogin
    );
*/
  });
/*
  describe('Testing for error responses', () => {
    describe('Testing the email', () => {
      test('Testing when the email does exist', () => {
        const responseLogin = requestAdminAuthLogin(
          'z7277272@ad.unsw.edu.au',
          'Password1',
        )
        expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(OK);

        const responseDetailsNew = requestGetUserDetails(responseRegister.body.session);
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
          'Password1',
        )
        expect(responseLogin.body).toStrictEqual({ error: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(BADREQUEST);

        const responseDetailsNew = requestGetUserDetails(responseRegister.body.session);
        expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
          responseDetails.body.user.numSuccessfulLogins + 1
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
          'Password1',
        )
        expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(OK);

        const responseDetailsNew = requestGetUserDetails(responseRegister.body.session);
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
          'Password22',
        )
        expect(responseLogin.body).toStrictEqual({ error: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(BADREQUEST);

        const responseDetailsNew = requestGetUserDetails(responseRegister.body.session);
        expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
          responseDetails.body.user.numSuccessfulLogins + 1
        );
        expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
          responseDetails.body.user.numFailedPasswordsSinceLastLogin + 1
        );
      });
    });
  });

  describe('Testing POST /v1/admin/auth/register works as intended', () => {
    expect(responseDetails.body.user.numSuccessfulLogins).toStrictEqual(1);
    expect(responseDetails.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

    // Can login
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1',
    )
    expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin.statusCode).toStrictEqual(OK);

    const requestUpdate = requestAdminUserPasswordUpdate(
      responseRegister.body.session,
      'Password1',
      'Password2'
    );
    expect(requestUpdate.body).toStrictEqual({});
    expect(requestUpdate.statusCode).toStrictEqual(OK);

    // Check if user can still login after password update
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password2',
    )
    expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin.statusCode).toStrictEqual(OK);

    // Make sure the old password doesn't work
    const responseLogin3 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1',
    )
    expect(responseLogin.body).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin.statusCode).toStrictEqual(BADREQUEST);

    const responseDetailsNew = requestGetUserDetails(responseRegister.body.session);
    expect(responseDetailsNew.body.user.numSuccessfulLogins).toStrictEqual(
      responseDetails.body.user.numSuccessfulLogins + 2
    );
    expect(responseDetailsNew.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(
      responseDetails.body.user.numFailedPasswordsSinceLastLogin + 1
    );
  });
*/
});
