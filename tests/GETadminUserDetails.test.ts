import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminAuthLogin,
  requestGetUserDetails,
  /*
  requestAdminUserPasswordUpdate,
  requestAdminUserDetailsUpdate*/
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

describe('Testing GET /v1/admin/user/details', () => {
  test('Testing the code 200 return value', () => {
    const responseUserDetails = requestGetUserDetails(responseRegister.body.session);
    expect(responseUserDetails.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    
  });

  describe('Testing GET /v1/admin/user/details works as intended', () => {
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(OK);

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
    expect(responseUserDetails.statusCode).toStrictEqual(OK);


    
    // Check user has correct details after password is updated
    const responseUserDetails2 = requestGetUserDetails(responseRegister.body.session);
    expect(responseUserDetails2).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails2.statusCode).toStrictEqual(OK);


    
    // Check user has correct details after details are updated
    const responseUserDetails3 = requestGetUserDetails(responseRegister.body.session);
    expect(responseUserDetails3).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails3.statusCode).toStrictEqual(OK);
  });

});
