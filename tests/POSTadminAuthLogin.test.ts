import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
//  requestGetUserDetails
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;

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
  test('Testing the code 200 return value', () => {
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1',
    )
    expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing the email', () => {
      test('Testing when the email does exist', () => {
        const responseLogin = requestAdminAuthLogin(
          'z7277272@ad.unsw.edu.au',
          'Password1',
        )
        expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(OK);
      });
  
      test('Testing when the email does not exist', () => {
        const responseLogin = requestAdminAuthLogin(
          'z696969@ad.unsw.edu.au',
          'Password1',
        )
        expect(responseLogin.body).toStrictEqual({ error: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(BADREQUEST);
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
      });

      test('Testing when the password is wrong', () => {
        const responseLogin = requestAdminAuthLogin(
          'z7277272@ad.unsw.edu.au',
          'Password22',
        )
        expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
        expect(responseLogin.statusCode).toStrictEqual(OK);
      });
    });
  });
/*
  describe('Testing POST /v1/admin/auth/register works as intended', () => {

  });
*/
});
