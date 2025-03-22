import {
  requestClear,
  requestAdminAuthRegister,
/*  requestAdminQuizCreate,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestGetQuizList */
} from './testsHelper';

import { describe } from 'node:test';

let response: Object;

beforeEach(() => {
  requestClear();
  response = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
});

describe('Testing POST /v1/admin/auth/register', () => {
  test('Testing the return value', () => {
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });

  
});
