import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminUserDetailsUpdate,
  // requestAdminUserPasswordUpdate
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;

let responseRegister: responseInterface;
// let responseDetails: responseInterface;
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

describe('Testing PUT /v1/admin/user/details', () => {
  test('Testing the code 200 return value', () => {
    const responseUpdate = requestAdminUserDetailsUpdate(
      session,
      'z69727@ad.unsw.edu.au',
      'First2',
      'Last2'
    )
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing the email', () => {
    
    });
    
    describe('Testing the password', () => {
    
    });
    
    describe('Testing the first name', () => {
    
    });
    
    describe('Testing the last name', () => {
    
    });
  });

  test('Testing PUT /v1/admin/user/details works as intended', () => {
    // testing valid cases
  });

});
