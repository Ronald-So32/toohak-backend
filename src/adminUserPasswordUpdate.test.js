import { adminUserPasswordUpdate, adminAuthRegister } from './auth.js';
import { clear } from './other.js';


describe ('update password', () => {

  beforeEach(() => {
    clear();
    let id = adminAuthRegister('email@email.com', 'password1', 'First', 'Last').userId;
  });
  
  test('greater than or equal to 8 characters', () => {
    expect(adminUserPasswordUpdate(id, 'password1', 'passowr')).
    toStrictEqual({error: expect.any(String)});
  });

  test('oldPassword is not the correct password', () => {
    expect(adminUserPasswordUpdate(id, wrongOldPass, newPassword1)).
    toStrictEqual({error: expect.any(String)});
  });

  test('User Id invalid', () => {
    expect(adminUserPasswordUpdate(-1, 'password1', 'newPass1')).
    toStrictEqual({error: expect.any(String)});
  });

  test ('New password does not contain at least one letter', () => {
    expect(adminUserPasswordUpdate(id, 'password1', '12345678')).
    toStrictEqual({error: expect.any(String)});
  });
   
  test ('New password does not contain at least 1', () => {
    expect(adminUserPasswordUpdate(id, 'password1', 'qwertyyu')).
    toStrictEqual({error: expect.any(String)});
  });
  
  test('Old Password is the same as password', () => {
    expect(adminUserPasswordUpdate(id, 'password1', 'password1')).
    toStrictEqual({error: expect.any(String)});
  });

  test('User Id, oldPassword, and newPassword are valid', () => {
    expect(adminUserPasswordUpdate(id, password1, newPassword1)).
    toStrictEqual({});
  });

  adminUserPasswordUpdate(id, password1, oldPassword1);
  test('New Password has already been used before by this user', () => {
    expect(adminUserPasswordUpdate(id, oldPassword1, password1)).
    toStrictEqual({error: expect.any(String)});
  });

})