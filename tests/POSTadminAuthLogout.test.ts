import {
  requestClear,
  responseInterface,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminAuthRegister,
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
let session: string;
let session2: string;

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

describe('Testing POST /v1/admin/auth/logout', () => {
  test('Testing the code 200 return value', () => {
    const res = requestAdminAuthLogout(session);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Invalid session', () => {
      const res = requestAdminAuthLogout(session + 'Invalid Session');
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(UNAUTHORISED);
      // Confirm cannot login because already logged in
      const responseLogin = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin.body).toStrictEqual({ error: expect.any(String) });
      expect(responseLogin.statusCode).toStrictEqual(UNAUTHORISED);
    });
    
    test('Logging out after already logging out once', () => {
      const res = requestAdminAuthLogout(session);
      expect(res.body).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(OK);

      const againRes = requestAdminAuthLogout(session);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(UNAUTHORISED);

      // confirm can log back in again
      const responseLogin = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin.statusCode).toStrictEqual(OK);
    });
  });

  describe('Testing POST /v1/admin/auth/logout works as intended', () => {

  });
});
