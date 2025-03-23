import { error } from 'console';
import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminUserDetailsUpdate,
  requestAdminUserPasswordUpdate
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
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

describe('Testing PUT /v1/admin/user/password', () => {
  test('Testing the code 200 return value', () => {
    const responsePassword = requestAdminUserPasswordUpdate(
      session,
      'Password1',
      'Password2'
    );
    expect(responsePassword.body).toStrictEqual({});
    expect(responsePassword.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responsePassword = requestAdminUserPasswordUpdate(
        session + "Invalid Session",
        'Password1',
        'Password2'
      );
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

      });
    });
  });

  test('Testing PUT /v1/admin/user/password works as intended', () => {
    
  });
});
