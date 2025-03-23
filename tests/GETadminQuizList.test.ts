import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetQuizList
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

describe('Testing GET /v1/admin/quiz/list', () => {
  test('Testing the code 200 return value', () => {
    const responsePassword = requestGetQuizList(session);
    expect(responsePassword.body).toStrictEqual({});
    expect(responsePassword.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responsePassword = requestGetQuizList(session + "Invalid Session");
      expect(responsePassword.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePassword.statusCode).toStrictEqual(UNAUTHORISED);
    });

  });

  test('Testing GET /v1/admin/quiz/list works as intended', () => {
    
  });
});
