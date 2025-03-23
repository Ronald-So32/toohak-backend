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

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  expect(responseRegister.statusCode).toStrictEqual(OK);
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

  });

  test('Testing PUT /v1/admin/user/password works as intended', () => {

  });
});
