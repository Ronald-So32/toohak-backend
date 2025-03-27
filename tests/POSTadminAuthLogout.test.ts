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
    const responseLogout = requestAdminAuthLogout(session);
    expect(responseLogout.body).toStrictEqual({});
    expect(responseLogout.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Invalid session', () => {
      const responseLogout = requestAdminAuthLogout(session + 'Invalid Session');
      expect(responseLogout.body).toStrictEqual({ error: expect.any(String) });
      expect(responseLogout.statusCode).toStrictEqual(UNAUTHORISED);

      // Confirm cannot login because already logged out
      const responseLogin = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin.body).toStrictEqual({ error: expect.any(String) });
      expect(responseLogin.statusCode).toStrictEqual(UNAUTHORISED);
    });
    
    test('Logging out after already logging out once', () => {
      const responseLogout = requestAdminAuthLogout(session);
      expect(responseLogout.body).toStrictEqual({});
      expect(responseLogout.statusCode).toStrictEqual(OK);

      const responseLogout2 = requestAdminAuthLogout(session);
      expect(responseLogout2.body).toStrictEqual({ error: expect.any(String) });
      expect(responseLogout2.statusCode).toStrictEqual(UNAUTHORISED);

      // Confirm user can log back in again
      const responseLogin = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin.statusCode).toStrictEqual(OK);
    });
    
    test('Multiple login sessions', () => {
      // Two other logins (3 in total)
      const responseLogin = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin.statusCode).toStrictEqual(OK);
      
      const responseLogin2 = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin2.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin2.statusCode).toStrictEqual(OK);

      // Logout all three sessions
      const responseLogout = requestAdminAuthLogout(session);
      expect(responseLogout.body).toStrictEqual({});
      expect(responseLogout.statusCode).toStrictEqual(OK);

      const responseLogout2 = requestAdminAuthLogout(session);
      expect(responseLogout2.body).toStrictEqual({});
      expect(responseLogout2.statusCode).toStrictEqual(OK);

      const responseLogout3 = requestAdminAuthLogout(session);
      expect(responseLogout3.body).toStrictEqual({});
      expect(responseLogout3.statusCode).toStrictEqual(OK);

      // Confirm user can log back in again
      const responseLogin3 = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin3.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin3.statusCode).toStrictEqual(OK);

      // Should only logout once more
      const responseLogout4 = requestAdminAuthLogout(session);
      expect(responseLogout4.body).toStrictEqual({});
      expect(responseLogout4.statusCode).toStrictEqual(OK);

      const responseLogout5 = requestAdminAuthLogout(session);
      expect(responseLogout5.body).toStrictEqual({ error: expect.any(String) });
      expect(responseLogout5.statusCode).toStrictEqual(UNAUTHORISED);
    });
  });

  describe('Testing POST /v1/admin/auth/logout works as intended', () => {
    // Create a quiz using original session
    const responseCreate = requestAdminQuizCreate(
      session,
      'Quiz Name',
      'Quiz Description'
    );

    // Login (In a theoretical different device)
    const responseLogin = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );


    // Logout
    const responseLogout = requestAdminAuthLogout(session);
    expect(responseLogout.body).toStrictEqual({});
    expect(responseLogout.statusCode).toStrictEqual(OK);


    // check quiz
    // edit quiz success again

    // lgout

    
    // check quiz
    // edit quiz fail

    // confirm can log back in again
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin.statusCode).toStrictEqual(OK);

    // edit quiz success

    const responseLogout2 = requestAdminAuthLogout(responseLogin.body.session);
    expect(responseLogout.body).toStrictEqual({});
    expect(responseLogout2.statusCode).toStrictEqual(OK);
  });
});
