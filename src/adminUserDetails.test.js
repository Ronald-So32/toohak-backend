import { adminUserDetails, adminAuthRegister, adminAuthLogin } from './auth.js';
import { clear } from './other.js';

describe('Test correct return types', () => {
  test('Test if the return type is expected', () => {
      clear();
      let id = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result = adminUserDetails(id.userId);

      expect(typeof result).toBe('object');
      expect(result).toEqual({
	user: {
          userId: id.userId,
          name: 'first last',
          email: 'email@email.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
	}
      });
      expect(result).not.toBeNull();
        
  });

  test('Test if the logins change', () => {
      clear();
      let id = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result1 = adminUserDetails(id.userId);
      adminAuthLogin('email@email.com', 'Password1');
      let result2 = adminUserDetails(id.userId);

      expect(typeof result1).toBe('object');
      expect(result1).toEqual({
	user: {
          userId: id.userId,
          name: 'first last',
          email: 'email@email.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
	}
      });
      expect(result1).not.toBeNull();

      // The value of numSuccessfulLogins should increase by 1
      expect(typeof result2).toBe('object');
      expect(result2).toEqual({
	user: {
          userId: id.userId,
          name: 'first last',
          email: 'email@email.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
	}
      });
      expect(result2).not.toBeNull();

  });

  test('Test if the failed logins change as well', () => {
      clear();
      let id = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result1 = adminUserDetails(id.userId);
      adminAuthLogin('email@email.com', 'Password2');
      let result2 = adminUserDetails(id.userId);
      adminAuthLogin('email@email.com', 'Password1');
      let result3 = adminUserDetails(id.userId);

      expect(typeof result1).toBe('object');
      expect(result1).toEqual({
	user: {
          userId: id.userId,
          name: 'first last',
          email: 'email@email.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
	}
      });
      expect(result1).not.toBeNull();

      // The value of numFailedPasswordsSinceLastLogin should increase by 1
      expect(typeof result2).toBe('object');
      expect(result2).toEqual({
	user: {
          userId: id.userId,
          name: 'first last',
          email: 'email@email.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 1,
	}
      });
      expect(result2).not.toBeNull();

      // The value of numSuccessfulLogins should increase by 1
      expect(typeof result3).toBe('object');
      expect(result3).toEqual({
	user: {
          userId: id.userId,
          name: 'first last',
          email: 'email@email.com',
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 1,
	}
      });
      expect(result3).not.toBeNull();
        
  });

});


describe('Test error cases', () => {
  test('Test when the id doesn\'t exist', () => {
      clear();
      let id = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result = adminUserDetails(id.userId + 727);

      expect(result).toMatchObject({ error: expect.any(String) });
	  
  });

});


// All of these should be valid
describe('Check normal usage cases', () => {
  test('Normal case 1', () => {
      clear();
      let id = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result = adminUserDetails(id.userId);

      expect(typeof result).toBe('object');
      expect(result).toEqual({
	user: {
          userId: id.userId,
          name: 'first last',
          email: 'email@email.com',
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
	}
      });
      expect(result).not.toBeNull();
        
  });

});



