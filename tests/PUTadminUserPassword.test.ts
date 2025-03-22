// import {} from '../src/auth.ts'

import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let id: number;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
  const register = request('PUT', SERVER_URL + '/v1/admin/auth/register', 
    { json: { email: 'email@email.com', password: 'password1', nameFirst: 'First', nameLast: 'Last' }, 
    timeout: TIMEOUT_MS }); 
  id = parseInt(JSON.parse(register.body.toString()));
});
  

describe('Invalid new passwords', () => {
test.each([
    {
    userId: id,
    oldPassword: 'password1',
    newPassword: 'passowr',
    description: 'greater than or equal to 8 characters'
    },
    {
    userId: id,
    oldPassword: 'wrongOldPass',
    newPassword: 'newPassword1',
    description: 'Old password is not the correct old password'
    },
    {
    userId: id + 999,
    oldPassword: 'password1',
    newPassword: 'newPass1',
    description: 'User Id invalid'
    },
    {
    userId: id,
    oldPassword: 'password1',
    newPassword: '12345678',
    description: 'New password does not contain at least one letter'
    },
    {
    userId: id,
    oldPassword: 'password1',
    newPassword: 'qwertyyu',
    description: 'New password does not contain at least one number'
    },
    {
    userId: id,
    oldPassword: 'password1',
    newPassword: 'password1',
    description: 'Old Password is the same as password'
    },
])('Cases where new password cannot be made - $description)',
    ({ userId, oldPassword, newPassword, description }) => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', { json: { userId, oldPassword, newPassword }, timeout: TIMEOUT_MS }); 
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });
});

describe('new Password already used', () => {
  const res = request('PUT', SERVER_URL + '/v1/admin/user/password', 
    { json: { userId: id, oldPassword: 'password1', newPassword: 'oldPassword1'}, timeout: TIMEOUT_MS });
  test('New Password has already been used before by this user', () => {
    const res2 = request('PUT', SERVER_URL + '/v1/admin/user/password', 
      { json: { userId: id, oldPassword: 'oldPassword1', newPassword: 'password1'}, timeout: TIMEOUT_MS });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toStrictEqual(400);
  });
});


describe('Check password is updated successfully', () => {
  test('Password updated correctly', () => {
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', 
      { json:{ userId: id, oldPassword: 'password1', newPassword: 'newPassword1'}, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(200);
 
    const loginRes = request('POST', SERVER_URL + '/v1/admin/auth/login', 
      { json:{ email: 'email@email.com', password: 'newPassword1'}, timeout: TIMEOUT_MS });
    expect(JSON.parse(loginRes.body.toString())).toStrictEqual({ userId: id});
    expect(loginRes.statusCode).toStrictEqual(200);

    const loginRes2 = request('POST', SERVER_URL + '/v1/admin/auth/login', 
      { json: { email: 'email@email.com', password: 'newPassword1' }, timeout: TIMEOUT_MS });

     // Makes sure that user can login with new password and successful logins update for user details
    const detailsRes = request('GET', SERVER_URL + '/v1/admin/user/details', 
      { json: { userId: id}, timeout: TIMEOUT_MS });

    expect(JSON.parse(detailsRes.body.toString())).toStrictEqual({ 
      user:
      {
        userId: id,
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});


describe('Password updated unssuccessfully, confirm cannot login with unsuccessful password', () => {
  test('Password test password updated unsuccessfully and confirm with failed login', () => {
    // set invalid password 
    const res = request('PUT', SERVER_URL + '/v1/admin/user/password', 
      { json:{ userId: id, oldPassword: 'password1', newPassword: 'passwor'}, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);

    // Makes sure that user can't login with password which was updated unsuccessfully and that it counts towards failed login attempts
    const loginRes = request('POST', SERVER_URL + '/v1/admin/auth/login', 
      { json:{ email: 'email@email.com', password: 'passwor'}, timeout: TIMEOUT_MS });
    expect(JSON.parse(loginRes.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(loginRes.statusCode).toStrictEqual(400);

    // Check to see if successful logins or failed logins num changed
    const detailsRes = request('GET', SERVER_URL + '/v1/admin/user/details', 
      { json: { userId: id}, timeout: TIMEOUT_MS });

    expect(JSON.parse(detailsRes.body.toString())).toStrictEqual({ 
      user:
      {
        userId: id,
        name: expect.any(String),
        email: expect.any(String),
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 1,
      }
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});


// need to add test for 401 Session is empty or invalid (does not refer to valid logged in user session