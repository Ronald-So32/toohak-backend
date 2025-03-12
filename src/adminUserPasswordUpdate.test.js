import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin, adminUserDetails } from './auth.js';
import { clear } from './other.js';

let id;

beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'password1', 'First', 'Last').userId;
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
      oldPassword:'wrongOldPass', 
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
      oldPassword:'password1', 
      newPassword: 'password1', 
      description: 'Old Password is the same as password' 
    },
  ])('Cases where new password cannot be made - $description)', 
    ({ userId, oldPassword, newPassword, description }) => {
      let result = adminUserPasswordUpdate(userId, oldPassword, newPassword);
      expect(result).toStrictEqual({ error: expect.any(String) });
    })
})

describe('new Password already used', () => {
  adminUserPasswordUpdate(id, 'password1', 'oldPassword1');
  test('New Password has already been used before by this user', () => {
    expect(adminUserPasswordUpdate(id, 'oldPassword1', 'password1')).
    toStrictEqual({ error: expect.any(String) });
  });
})

describe('Check password is updated successfully', () => {
  test('Password updated correctly', () => {
    expect(adminUserPasswordUpdate(id, 'password1', 'newPassword1')).
    toStrictEqual({});
    expect(adminAuthLogin('email@email.com', 'newPassword1').toStrictEqual({id}));
    adminAuthLogin('email@email.com', 'newPassword1');
    expect(adminUserDetails(id).toStrictEqual({ user:
      {
        userId: id,
        name: id.name,
        email: id.email,
        numSuccessfulLogins: '1',
        numFailedPasswordsSinceLastLogin: '0',
      }
    }))
  });
}) 

describe('Password updated unssuccessfully, confrim cannot login with unsuccessful password', () => {
  test('Password test password updated unsuccessfully and confirm with failed login', () => {
    expect(adminUserPasswordUpdate(id, 'password1', 'passwor')).
    toStrictEqual({ error: expect.any(String) });
    expect(adminAuthLogin('email@email.com', 'passwor').
    toStrictEqual({ error: expect.any(String) }));
  })
})


// describe('Passsword cannot be updated for any of the below reasons', () => {

//   test('greater than or equal to 8 characters', () => {
//     expect(adminUserPasswordUpdate(id, 'password1', 'passowr')).
//     toStrictEqual({ error: expect.any(String)} );
//   });

//   test('oldPassword is not the correct password', () => {
//     expect(adminUserPasswordUpdate(id, wrongOldPass, newPassword1)).
//     toStrictEqual({ error: expect.any(String) });
//   });

//   test('User Id invalid', () => {
//     expect(adminUserPasswordUpdate(id + 999, 'password1', 'newPass1')).
//     toStrictEqual({ error: expect.any(String)} );
//   });

//   test ('New password does not contain at least one letter', () => {
//     expect(adminUserPasswordUpdate(id, 'password1', '12345678')).
//     toStrictEqual({ error: expect.any(String) });
//   });
   
//   test ('New password does not contain at least one number', () => {
//     expect(adminUserPasswordUpdate(id, 'password1', 'qwertyyu')).
//     toStrictEqual({ error: expect.any(String) });
//   });
  
//   test('Old Password is the same as password', () => {
//     expect(adminUserPasswordUpdate(id, 'password1', 'password1')).
//     toStrictEqual({ error: expect.any(String) });
//   });

//   adminUserPasswordUpdate(id, password1, oldPassword1);
//   test('New Password has already been used before by this user', () => {
//     expect(adminUserPasswordUpdate(id, oldPassword1, password1)).
//     toStrictEqual({ error: expect.any(String) });
//   });
// })

