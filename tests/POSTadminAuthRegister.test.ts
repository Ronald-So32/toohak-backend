import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
/*  requestAdminQuizCreate,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestGetQuizList */
} from './testsHelper';

import { describe } from 'node:test';

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

describe('Testing POST /v1/admin/auth/register', () => {
  test('Testing the return value', () => {
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(200);
  });

  describe('Testing for error responses', () => {
    
  });
/*
  describe('Testing POST /v1/admin/auth/register works as intended', () => {
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(200);
    
    // Check user can login
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin).toStrictEqual({ session: responseRegister.body.session });
    expect(responseLogin.statusCode).toStrictEqual(200);

    // Check user has correct details
    const responseUserDetails = requestGetUserDetails(responseRegister.body.session);
    expect(responseUserDetails).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails.statusCode).toStrictEqual(200);
  });
*/
});
