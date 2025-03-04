import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

describe('Test correct return types', () => {
  test('Test if the return is an object', () => {
    clear();
    let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

    // Check if the return value is an object and is not a null
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();
  });

   test('Test if the return object has a userId', () => {
    clear();
    let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

    // Check if the object has a field of userId and contains a number, also has to be not a null
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
      let result1 = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result2 = adminAuthRegister('email@email.com', 'Password2', 'first', 'last');

      // First one should be valid
      expect(typeof result1).toBe('object');
      expect(typeof result1).toEqual({
        userId: expect.any(Number)
      });
      expect(result1).not.toBeNull();
        
      expect(result2).toMatchObject({ error: expect.any(String) });
    });

    test('Email is not used', () => {
      clear();
      let result1 = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');
      let result2 = adminAuthRegister('email2@email.com', 'Password2', 'firstt', 'lastt');

      // Both should be valid
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
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
        
    });

    test('Invalid email 1', () => {
      clear();
      let result = adminAuthRegister('emailemail.com', 'Password1', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });

    test('Valid email 2', () => {
      clear();
      let result = adminAuthRegister('user.name+some+thing@example.com', 'Password1', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
        
    });

    test('Invalid email 2', () => {
      clear();
      let result = adminAuthRegister('invalid-email', 'Password1', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });


    test('Valid email 3', () => {
      clear();
      let result = adminAuthRegister('user@sub.domain.com', 'Password1', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
        
    });

    test('Invalid email 3', () => {
      clear();
      let result = adminAuthRegister('@missingusername.com', 'Password1', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });

    test('Invalid email 4', () => {
      clear();
      let result = adminAuthRegister('user@.com', 'Password1', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });

  });


  describe('NameFirst test cases', () => {
    describe('Containing valid characters 1', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

      // Lowercase letters are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
	
    });

    describe('Containing invalid characters 1', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'fi$#rst', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

    describe('Containing valid characters 2', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'FIRST', 'last');

      // Uppercase letters are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
	
    });

    describe('Containing invalid characters 2', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'fi@%$/*rst', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

    describe('Containing valid characters 3', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'fir_st', 'last');

      // Hyphens are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
	
    });

    describe('Containing invalid characters 3', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', '!@#$%%*', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

    describe('Containing valid characters 4', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'fir st', 'last');

      // Spaces are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
	
    });

    describe('Containing valid characters 5', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'fir\'st', 'last');

      // Apostrophes are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
	
    });

    describe('Containing valid characters 6', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'Fi _r\'St', 'last');
      
      // Combination of valid characters
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();
	
    });

    test('Contains less than 2 characters', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'f', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

    test('Contains more than 20 characters', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'firstfirstfirstfirstfirstfirst', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

  });

  describe('NameLast test cases', () => {
    describe('Containing valid characters 1', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

      // Lowercase letters are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    describe('Containing invalid characters 1', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'las*/t');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

    describe('Containing valid characters 2', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'LAST');

      // Uppercase letters are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    describe('Containing invalid characters 2', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'la@st');

      expect(result).toMatchObject({ error: expect.any(String) });

    });


    describe('Containing valid characters 3', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'la_st');

      // Hyphens are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    describe('Containing invalid characters 3', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', '*/-%$#');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

    describe('Containing valid characters 4', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'la st');

      // Spaces are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    })

    describe('Containing valid characters 5', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'la\'st');

      // Apostrophes are legal
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    describe('Containing valid characters 6', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'L\'a_S t');

      // Combination of valid characters
      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    test('Contains less than 2 characters', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'l');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

    test('Contains more than 20 characters', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'lastlastlastlastlastlastlastlastlastlastlastlast');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

  });

  describe('Password test cases', () => {
    describe('Containing valid characters 1', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    describe('Containing invalid characters 1', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Passwordpass', 'first', 'last');

      // No number in the password
      expect(result).toMatchObject({ error: expect.any(String) });

    });

    describe('Containing valid characters 2', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Testing123', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    describe('Containing invalid characters 2', () => {
      clear();
      let result = adminAuthRegister('email@email.com', '1234567890', 'first', 'last');

      // No letter in the password
      expect(result).toMatchObject({ error: expect.any(String) });

    });

    describe('Containing valid characters 3', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'qweerty727@#', 'first', 'last');

      expect(typeof result).toBe('object');
      expect(typeof result).toEqual({
        userId: expect.any(Number)
      });
      expect(result).not.toBeNull();

    });

    describe('Containing invalid characters 3', () => {
      clear();
      let result = adminAuthRegister('email@email.com', ')@*(#$&@#$&*#*%', 'first', 'last');

      // No number or letter in password
      expect(result).toMatchObject({ error: expect.any(String) });

    });

    test('Contains less than 8 characters with valid characters', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'P1', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

    test('Contains less than 8 characters with invalid characters', () => {
      clear();
      let result = adminAuthRegister('email@email.com', '*', 'first', 'last');

      expect(result).toMatchObject({ error: expect.any(String) });

    });

  });

)};


// All of these should be valid
describe('Check normal usage cases', () => {
  test('Normal case 1', () => {
      clear();
      let result = adminAuthRegister('email@email.com', 'Password1', 'first', 'last');

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

