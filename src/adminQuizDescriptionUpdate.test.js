import { adminQuizCreate, adminQuizDescriptionUpdate } from './quiz.js';
import { adminAuthRegister } from './auth.js'
import { clear } from './other.js';

let userId;
let quizId;

beforeEach(() => {
  clear();
  userId = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
  quizId = adminQuizCreate(userId, 'Quiz Name', 'Description').quizId;
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned is object which is empty', () => {
    let result = adminQuizDescriptionUpdate(userId, quizId, 'New Description');
    expect(typeof result).toBe('object');
    expect(result).toEqual({});
    expect(result).not.toBeNull();
  })
});

describe('Test error cases', () => {
  test('Invalid userId - When id doesn\'t exist', () => {
    let result = adminQuizDescriptionUpdate(userId + 999, quizId, 'New Description');
    expect(result).toMatchObject({ error: expect.any(String) });
  })

  test('Invalid quizId - When quiz doesn\'t exist', () => {
    let result = adminQuizDescriptionUpdate(userId, quizId + 999, 'New Description');
    expect(result).toMatchObject({ error: expect.any(String) });
  })

  test('Invalid quizId - When quiz is not owned by user', () => {
    // Create a second user
    const userId2 = adminAuthRegister('email2@email.com', 'Password1', 'First', 'Last').userId;
    // Create a quiz for second user
    const quizId2 = adminQuizCreate(userId2, 'Quiz Name 2', 'Description').quizId;
    
    // Try to update first user's quiz with second user's ID
    let result = adminQuizDescriptionUpdate(userId2, quizId, 'New Description');
    expect(result).toMatchObject({ error: expect.any(String) });
  })
  
  describe('Test validity of Description', () => {
    test('Invalid description - Description is more than 100 characters with normal spaces', () => {
      let result = adminQuizDescriptionUpdate(userId, quizId, 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTU VWXYZ 123456 7890 ! @ # $ % ^ & * ( ) _ + - =');
      expect(result).toMatchObject({ error: expect.any(String) });
    })

    test('Invalid description - Description is more than 100 characters with spaces at the front', () => {
      let result = adminQuizDescriptionUpdate(userId, quizId, '  abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTUVWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =');
      expect(result).toMatchObject({ error: expect.any(String) });
    })

    test('Invalid description - Description is more than 100 characters with spaces at the end', () => {
      let result = adminQuizDescriptionUpdate(userId, quizId, 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTUVWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =  ');
      expect(result).toMatchObject({ error: expect.any(String) });
    })
    
    test('Valid description - Empty string', () => {
      let result = adminQuizDescriptionUpdate(userId, quizId, '');
      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })

    test('Valid description - Description with 100 characters', () => {
      let result = adminQuizDescriptionUpdate(userId, quizId, 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTU VWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =');
      expect(typeof result).toBe('object');
      expect(result).toEqual({});
      expect(result).not.toBeNull();
    })
  })
});