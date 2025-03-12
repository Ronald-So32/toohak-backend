import { adminUserDetailsUpdate } from './auth.js'
import { adminAuthRegister } from './auth.js'
import { clear } from './other.js';

let id;

beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
});

describe('Test correct return type and normal case usage', () => {

  test.each([
    { email: 'email@email.com', nameFirst: 'First', nameLast: 'Last', description: 'No changes made to user\'s details' },
    { email: 'Email2@email.com', nameFirst: 'First', nameLast: 'Last', description: 'Changes made to user\'s email' },
    { email: 'email@email.com', nameFirst: 'Second', nameLast: 'Last', description: 'Changes made to user\'s first name' },
    { email: 'email@email.com', nameFirst: 'First', nameLast: 'SecondLast', description: 'Changes made to user\'s last name' },
    { email: 'Email@email.com', nameFirst: 'Second', nameLast: 'Last', description: 'Changes made to user\'s email and first name' },
    { email: 'Email@email.com', nameFirst: 'First', nameLast: 'SecondLast', description: 'Changes made to user\'s email and last name' },
    { email: 'email@email.com', nameFirst: 'Second', nameLast: 'SecondLast', description: 'Changes made to user\'s first and last name' },
    { email: 'Email@email.com', nameFirst: 'Second', nameLast: 'SecondLast', description: 'Changes made to all of user\'s details' },
  ])('Valid return types and normal case usage - %s', ({email, nameFirst, nameLast, description}) => {
    let result = adminUserDetailsUpdate(id, email, nameFirst, nameLast);

    expect(typeof result).toBe('object');
    expect(result).toEqual({});
    expect(result).not.toBeNull();
  })

});

describe('Test error cases', () => { 
  test('Invalid userId - When id doens\'t exist', () => {
    let result = adminUserDetailsUpdate(id + 999, 'email@email.com', 'First', 'Last');
    expect(result).toMatchObject({ error: expect.any(String) });
  })

  describe('Test validity of emails', () => {

    test('Invalid email - Email already in use', () => {
      let id2 = adminAuthRegister('email2@email.com', 'Password1', 'First', 'Last').userId;
      let result1 = adminUserDetailsUpdate(id, 'email@email.com', 'First', 'Last');

      expect(typeof result1).toBe('object');
      expect(result1).toEqual({});
      expect(result1).not.toBeNull();

      let result2 = adminUserDetailsUpdate(id, 'email2@email.com', 'First', 'Last');

      expect(result2).toMatchObject({ error: expect.any(String) });
    })

    test.each([
      { email: 'emailemail.com', nameFirst: 'First', nameLast: 'Last' },
      { email: 'invalid-email', nameFirst: 'First', nameLast: 'Last' },
      { email: '@missingusername.com', nameFirst: 'First', nameLast: 'Last' },
      { email: 'user@.com', nameFirst: 'First', nameLast: 'Last' },
    ])('Invalid email format - %s', ({email, nameFirst, nameLast}) => {
      let result = adminUserDetailsUpdate(id, email, nameFirst, nameLast);
      expect(result).toEqual({ error: expect.any(String) });
    })
  })
  
  describe('Test validity of first names', () => {
    test.each([
      { email: 'email@email.com', nameFirst: 'Fi@ %$/st*', nameLast: 'Last' },
      { email: 'email@email.com', nameFirst: '!@#$%%*', nameLast: 'Last' },
      { email: 'email@email.com', nameFirst: 'First123', nameLast: 'Last' },
    ])('Invalid first name (containing invalid characters) - %s', ({email, nameFirst, nameLast}) => {
      let result = adminUserDetailsUpdate(id, email, nameFirst, nameLast);
      expect(result).toEqual({ error: expect.any(String) });
    })

    test.each([
      { email: 'email@email.com', nameFirst: 'Fir st', nameLast: 'Last' },
      { email: 'email@email.com', nameFirst: 'Fir\'st', nameLast: 'Last' },
      { email: 'email@email.com', nameFirst: 'Fi -\'St', nameLast: 'Last' },
      { email: 'email@email.com', nameFirst: 'F i -\'S t', nameLast: 'Last' },
    ])('Valid first name (containing valid characters) - %s', ({email, nameFirst, nameLast}) => {
      let result = adminUserDetailsUpdate(id, email, nameFirst, nameLast);
      
      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })

    test('Invalid first name - Containing less then 2 characters', () => {
      let result = adminUserDetailsUpdate(id, 'email@email.com', 'F', 'Last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });
    
    test('Invalid first name - containing more then 20 characters', () => {
      let result = adminUserDetailsUpdate(id, 'email@email.com', 'firstfirstfirstfirstfirst', 'Last');

      expect(result).toMatchObject({ error: expect.any(String) });
    });

    test('Valid first name - Containing exactly 2 characters', () => {
      let result = adminUserDetailsUpdate(id, 'email@email.com', 'Fi', 'Last');

      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })

    test('Valid first name - Containing exactly 20 characters', () => {
      let result = adminUserDetailsUpdate(id, 'email@email.com', 'Firstfirstfirstfirst', 'Last');

      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })

  }) 

  describe('Test validity of first names', () => {
    test.each([
      { email: 'email@email.com', nameFirst: 'First', nameLast: 'La@% $/st' },
      { email: 'email@email.com', nameFirst: 'First', nameLast: '!@#$%%*' },
      { email: 'email@email.com', nameFirst: 'First', nameLast: 'Last123' },
    ])('Invalid last name (containing invalid characters) - %s', ({email, nameFirst, nameLast}) => {
      let result = adminUserDetailsUpdate(id, email, nameFirst, nameLast);
      expect(result).toMatchObject({ error: expect.any(String) });
    })

    test.each([
      { email: 'email@email.com', nameFirst: 'First', nameLast: 'La st' },
      { email: 'email@email.com', nameFirst: 'First', nameLast: 'La\'st' },
      { email: 'email@email.com', nameFirst: 'First', nameLast: 'La-\'St' },
      { email: 'email@email.com', nameFirst: 'First', nameLast: 'L a-\'S t' },
    ])('Valid last name (containing valid characters) - %s', ({email, nameFirst, nameLast}) => {
      let result = adminUserDetailsUpdate(id, email, nameFirst, nameLast);
      
      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })

    test('Invalid last name - Containing less then 2 characters', () => {
      let result = adminUserDetailsUpdate(id, 'email@email.com', 'First', 'L');

      expect(result).toMatchObject({ error: expect.any(String) });
    });
    
    test('Invalid last name - containing more then 20 characters', () => {
      let result = adminUserDetailsUpdate(id, 'email@email.com', 'First', 'Lastlastlastlastlastlast');

      expect(result).toMatchObject({ error: expect.any(String) });
    });

    test('Valid last name - Containing exactly 2 characters', () => {
      let result = adminUserDetailsUpdate(id, 'email@email.com', 'First', 'La');

      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })

    test('Valid first name - Containing exactly 20 characters', () => {
      let result = adminUserDetailsUpdate(id, 'email@email.com', 'First', 'Lastlastlastlastlast');

      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })

  })

})