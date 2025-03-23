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
// const BADREQUEST = 400;

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
    const responsePassword = requestAdminAuthLogin(
      'Password1',
      'Password2'
    );
    expect(responsePassword.body).toStrictEqual({});
    expect(responsePassword.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the password is already used', () => {
      
    });

    describe('Testing the new password', () => {
      describe('Valid cases', () => {
    
      });

      describe('Invalid cases', () => {
      
      });
    });
  });

  test('Testing PUT /v1/admin/user/password works as intended', () => {
    
  });
});
