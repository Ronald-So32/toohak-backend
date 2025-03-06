import { adminUserPasswordUpdate } from './auth';
import { getData } from './dataStore';

describe ('update password', () => {

  test('greater than or equal to 8 characters', () => {
    expect(adminUserPasswordUpdate(1, 'oldPassword1', 'passowr')).
    toEqual({error: 'New password has less than 8 characters'});
  });

  test('User Id invalid', () => {
    expect(adminUserPasswordUpdate(-1, 'oldPassword1', 'newPassword1')).
    toEqual({error: 'User Id invalid'});
  });

  test ('New password does not contain at least one letter', () => {
    expect(adminUserPasswordUpdate(1, 'oldPassword1', '12345678')).
    toEqual({error: 'New password does not contain at least one letter'});
  });
   
  test ('New password does not contain at least 1', () => {
    expect(adminUserPasswordUpdate(1, 'oldPassword1', 'qwertyyu')).
    toEqual({error: 'New password does not contain at least one letter'});
  });
  
  test('Old Password is the same as password', () => {
    expect(adminUserPasswordUpdate(1, 'oldPassword1', 'oldPassword1')).
    toEqual('oldPassword');
  });
  
  test('User Id invalid', () => {
    expect(adminUserPasswordUpdate(-1, oldPassword, newPassword)).
    toEqual({error: 'specific error message here'});
  });

  test('User Id, oldPassword, and newPassword are valid', () => {
    expect(adminUserPasswordUpdate(1, oldPassword1, newPassword1)).
    toEqual({});
  });

  // how to test for if old password is not entered correclty? 

  test('New Password has already been used before by this user', () => {
    expect(adminUserPasswordUpdate(1, oldPassword1, alreadyPassword1)).
    toEqual({error: 'New Password has already been used before by this user'});
  });

})