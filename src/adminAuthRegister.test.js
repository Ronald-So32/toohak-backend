import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

describe('Test correct return types', () => {
  test('Test if the return is an object', () => {
    clear();
    let result = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

   test('Test if the return object has a userId', () => {
    clear();
    let result = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');
    expect(typeof result).toEqual({
      userId: expect.any(Number)
    });
    expect(result).not.toBeNull();
  });

)};


describe('Test error cases', () => {
  describe('Test if the email is already used by another user', () => {
    test('Email is already used', () => {
      clear();
      let result1 = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');
      let result2 = adminAuthRegister('z1111@ad.unsw.edu.au', '23', 'irst', 'ast');

      expect(typeof result1).toBe('object');
      expect(typeof result1).toEqual({
        userId: expect.any(Number)
      });
      expect(result1).not.toBeNull();
        

      expect(result2).toMatchObject({ error: expect.any(String) });
    });

    test('Email is not used', () => {
      clear();
      let result1 = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');
      let result2 = adminAuthRegister('z1@ad.unsw.edu.au', '23', 'irst', 'ast');

      expect(typeof result1).toBe('object');
      expect(typeof result1).toEqual({
        userId: expect.any(Number)
      });
      expect(result1).not.toBeNull();

      expect(typeof result2).toBe('object');
      expect(typeof result2).toEqual({
        userId: expect.any(Number)
      });
      expect(result2).not.toBeNull();
 
    });
  });


  describe('Test valid emails', () => {
    test('Valid email 1', () => {
      clear();
      let result = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
        
    });

    test('Invalid email 1', () => {
      clear();
      let result = adminAuthRegister('z1111ad.unsw.edu.au', '123', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });

    test('Valid email 2', () => { /////////////////////////////// TODO: add different email cases
      clear();
      let result = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
        
    });

    test('Invalid email 2', () => {
      clear();
      let result = adminAuthRegister('z1111ad.unsw.edu.au', '123', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });


    test('Valid email 3', () => {
      clear();
      let result = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
        
    });

    test('Invalid email 3', () => {
      clear();
      let result = adminAuthRegister('z1111ad.unsw.edu.au', '123', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });

  });


  describe('NameFirst test cases', () => {
    describe('Containing valid characters 1', () => {

    });

    describe('Containing invalid characters 1', () => {

    });

    test('Contains less than 2 characters', () => {

    });

    test('Contains more than 20 characters', () => {

    });

  });

  describe('NameLast test cases', () => {
    describe('Containing valid characters 1', () => {

    });

    describe('Containing invalid characters 1', () => {

    });

    test('Contains less than 2 characters', () => {

    });

    test('Contains more than 20 characters', () => {

    });

  });

  describe('Password test cases', () => {
    describe('Containing valid characters 1', () => {

    });

    describe('Containing invalid characters 1', () => {

    });

    test('Contains less than 8 characters', () => {

    });

  });

)};


describe('Check normal usage cases', () => {
  test('Normal case 1', () => {
      clear();
      let result = adminAuthRegister('z1111@ad.unsw.edu.au', '123', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
        
  });

)};


describe('Random normal test cases', () => {
  /*test('', () => {

  });*/
  // TODO: add some random test cases after implementation
)};

