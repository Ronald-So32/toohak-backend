import { adminAuthLogin, adminAuthRegister } from './auth.js';
import { clear } from './other.js';

describe('Test correct return types', () => {
  test('Test if the return is an object', () => {
    clear();
    adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    let result = adminAuthLogin('email@email.com', 'Password1');

    // Check if the return value is an object and is not a null
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

   test('Test if the return object has a userId', () => {
    clear();
    adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
    let result = adminAuthLogin('email@email.com', 'Password1');

    // Check if the object has a field of userId and contains a number, also has to be not a null
    expect(result).toEqual({
      userId: expect.any(Number)
    });
    expect(result).not.toBeNull();
  });

});


describe('Test error cases', () => {
  describe('Test if the email exists', () => {
    test('Email exists', () => {
      clear();
      adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result = adminAuthLogin('email@email.com', 'Password1');

      expect(typeof result).toBe('object');
      expect(result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    test('Email doesn\'t exist', () => {
      clear();
      adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result = adminAuthLogin('emailw@email.com', 'Password1');
        
      expect(result).toMatchObject({ error: expect.any(String) });

    });

  });

  describe('Test if the password is correct', () => {
    test('Password is correct', () => {
      clear();
      adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result = adminAuthLogin('email@email.com', 'Password1');

      expect(typeof result).toBe('object');
      expect(result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    test('Password is incorrect', () => {
      clear();
      adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result = adminAuthLogin('email@email.com', 'Password2');
        
      expect(result).toMatchObject({ error: expect.any(String) });

    });

  });

});


// All of these should be valid
describe('Check normal usage cases', () => {
  test('Normal case 1', () => {
      clear();
      adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result = adminAuthLogin('email@email.com', 'Password1');

      expect(typeof result).toBe('object');
      expect(result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
        
  });

});



