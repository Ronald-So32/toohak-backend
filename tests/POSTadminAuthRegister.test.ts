import {
  requestClear,
  requestAdminAuthRegister,
/*  requestAdminQuizCreate,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestGetQuizList */
} from './helper';

import { describe } from 'node:test';

beforeEach(() => {
  requestClear();
});

describe('Testing POST /v1/admin/auth/register', () => {
  test('Testing the return value', () => {
    const response = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });

  
});
