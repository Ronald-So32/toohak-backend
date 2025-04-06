import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminUserPasswordUpdate
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
let session: string;

// Before each test clears the data and register an user and obtains the current session
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

describe('Testing PUT /v1/admin/user/password', () => {
  test('Testing the code 200 return value', () => {
    // Updates the password of the current user
    const responsePassword = requestAdminUserPasswordUpdate(
      session,
      'Password1',
      'Password2'
    );
    // Checks that response from password update returns an empty object
    // and a status code of 200
    expect(responsePassword.body).toStrictEqual({});
    expect(responsePassword.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responsePassword = requestAdminUserPasswordUpdate(
        session + 'Invalid Session',
        'Password1',
        'Password2'
      );
      // Checks that the response of the invalid password update returns an error object
      // and a status code of 401
      expect(responsePassword.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePassword.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when the password is already used', () => {
      requestAdminUserPasswordUpdate(session, 'Password1', 'Password2');

      // Try to update the password back to "Password1"
      const responsePassword = requestAdminUserPasswordUpdate(
        session,
        'Password2',
        'Password1'
      );
      // Checks that the response from password update returns an error obeject
      // and a status code of 400
      expect(responsePassword.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePassword.statusCode).toStrictEqual(BADREQUEST);
    });

    describe('Testing the new password', () => {
      describe('Valid cases', () => {
        test.each([
          {
            description: 'New password meets all requirements',
            oldPassword: 'Password1',
            newPassword: 'NewPassword1',
          },
          {
            description: 'New password with special characters',
            oldPassword: 'Password1',
            newPassword: 'NewPass@123',
          },
        ])('$description', ({ oldPassword, newPassword }) => {
          const responsePassword = requestAdminUserPasswordUpdate(
            session,
            oldPassword,
            newPassword
          );
          expect(responsePassword.body).toStrictEqual({});
          expect(responsePassword.statusCode).toStrictEqual(OK);
        });
      });

      describe('Invalid cases', () => {
        test.each([
          {
            description: 'New password is less than 8 characters',
            oldPassword: 'Password1',
            newPassword: 'Pass1',
          },
          {
            description: 'New password does not contain at least one number',
            oldPassword: 'Password1',
            newPassword: 'NewPassword',
          },
          {
            description: 'New password does not contain at least one letter',
            oldPassword: 'Password1',
            newPassword: '12345678',
          },
          {
            description: 'Old Password and New Password match exactly',
            oldPassword: 'Password1',
            newPassword: 'Password1',
          },
          {
            description: 'Old Password is not the correct old password',
            oldPassword: 'WrongPassword',
            newPassword: 'NewPassword1',
          },
        ])('$description', ({ oldPassword, newPassword }) => {
          const responsePassword = requestAdminUserPasswordUpdate(
            session,
            oldPassword,
            newPassword
          );
          expect(responsePassword.body).toStrictEqual({ error: expect.any(String) });
          expect(responsePassword.statusCode).toStrictEqual(BADREQUEST);
        });
      });
    });
  });

  test('Testing PUT /v1/admin/user/password works as intended', () => {
    // Initial register works
    const responseDetails = requestGetUserDetails(session);
    expect(responseDetails.body.user.numSuccessfulLogins).toStrictEqual(1);
    expect(responseDetails.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

    const responseLogin = requestAdminAuthLogin('z7277272@ad.unsw.edu.au', 'Password1');
    expect(responseLogin.body).toStrictEqual({ session: responseLogin.body.session });
    expect(responseLogin.statusCode).toStrictEqual(OK);

    const responseDetails2 = requestGetUserDetails(session);
    expect(responseDetails2.body.user.numSuccessfulLogins).toStrictEqual(2);
    expect(responseDetails2.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

    // Change the password
    const responsePassword = requestAdminUserPasswordUpdate(
      session,
      'Password1',
      'NewPassword1'
    );
    expect(responsePassword.body).toStrictEqual({});
    expect(responsePassword.statusCode).toStrictEqual(OK);

    const responseLogin2 = requestAdminAuthLogin('z7277272@ad.unsw.edu.au', 'NewPassword1');
    expect(responseLogin2.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(OK);

    const responseDetails3 = requestGetUserDetails(session);
    expect(responseDetails3.body.user.numSuccessfulLogins).toStrictEqual(3);
    expect(responseDetails3.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);

    // Change password fail
    const responsePassword2 = requestAdminUserPasswordUpdate(
      session,
      'Password1',
      'AnotherNewPassword1'
    );
    expect(responsePassword2.body).toStrictEqual({ error: expect.any(String) });
    expect(responsePassword2.statusCode).toStrictEqual(BADREQUEST);

    const responseLogin3 = requestAdminAuthLogin('z7277272@ad.unsw.edu.au', 'Password1');
    expect(responseLogin3.body).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin3.statusCode).toStrictEqual(BADREQUEST);

    const responseDetails4 = requestGetUserDetails(session);
    expect(responseDetails4.body.user.numSuccessfulLogins).toStrictEqual(3);
    expect(responseDetails4.body.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
  });
});
