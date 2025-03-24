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
  requestAdminAuthLogin('z7277272@ad.unsw.edu.au','Password1');
});

describe('Valid test case', () => {
  test('Valid session, and is logged in first', () => {
    const res = requestAdminAuthLogout(session);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(OK);
  });
});


describe('Invalid test case', () => {
  test('Invalid session', () => {
    const res = requestAdminAuthLogout(session + 'Invalid Session');
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(UNAUTHORISED);
  });
  
  test('Loggin out after already logging out once', () => {
    const res = requestAdminAuthLogout(session);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(OK);

    const againRes = requestAdminAuthLogout(session);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(UNAUTHORISED);
  });

  // Need more test cases? 
});

