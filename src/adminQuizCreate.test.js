import { adminQuizCreate } from './quiz.js';
import { adminAuthRegister } from './auth.js'
import { clear } from './other.js';

let id;

<<<<<<< HEAD
beforeAll(() => {
    clear();
    id = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last');
=======
beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
>>>>>>> master
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned is object which has a quizId and quizId is a number', () => {
    let result = adminQuizCreate(id, 'Quiz Name', 'Description');
    expect(typeof result).toBe('object');
    expect(result).toEqual({
      quizId: expect.any(Number)
    });
    expect(result).not.toBeNull();
  })
});

describe('Test error cases', () => {
  test('Invalid userId - When id doens\'t exist', () => {
<<<<<<< HEAD
    let result = adminQuizCreate(id.userId + 999, 'Quiz Name', 'Description');
=======
    let result = adminQuizCreate(id + 999, 'Quiz Name', 'Description');
>>>>>>> master

    expect(result).toMatchObject({ error: expect.any(String) });
  })

  describe('Test vadility of name', () => {
    test.each([
      { name: '@Quiz_Name!!!', description: 'Name contains invalid characters' },
      { name: 'Hi', description: 'Name is too short without spaces' },
      { name: ' I', description: 'Name is too short with spaces'},
      { name: '', description: 'Name is too short empty string'},
      { name: 'HiIamQuiz1234567890abcdefghijkl', description: 'Name is too long with no spaces'},
      { name: ' Hi I am Quiz 1234567890 abcdef', description: 'Name is too long with spaces at front'},
      { name: 'Hi I am Quiz 1234567890 abcdef ', description: 'Name is too long with spaces at end'},
      { name: 'Hi I am Quiz 123 456 7890 abc def', description: 'Name is too long with normal spaces'},
<<<<<<< HEAD
    ])('Invalid name - "%s" %s', (name, description) => {
      let result = adminQuizCreate(id.userId, name, description);
=======
    ])('Invalid name - "%s" %s', ({name, description}) => {
      let result = adminQuizCreate(id, name, description);
>>>>>>> master
      expect(result).toMatchObject({ error: expect.any(String) });
    });

    test.each([
      { name: 'And', description: 'Name has 3 more valid characters with no spaces' },
      { name: 'H i', description: 'Name 1 with 3 more valid characters with spaces' },
      { name: ' Hi', description: 'Name 2 with 3 more valid characters with spaces'},
      { name: 'Hi ', description: 'Name 3 with 3 more valid characters with spaces'},
      { name: ' I ', description: 'Name 4 with 3 more valid characters with spaces'},
      { name: 'HiIamQuiz1234567890abcdefghijk', description: 'Name with 30 or less valid characters with no spaces'},
      { name: ' Hi I am Quiz 1234567890 abcde', description: 'Name with 30 or less valid characters with spaces at front'},
      { name: 'Hi I am Quiz 1234567890 abcde ', description: 'Name with 30 or less valid characters with spaces at end'},
      { name: 'Hi I am Quiz 12345 67890 abcde', description: 'Name with 30 or less valid characters with normal spaces'},
<<<<<<< HEAD
    ])('Valid name - "%s" %s', (name, description) => {
      let result = adminQuizCreate(id.userId, name, description);
=======
    ])('Valid name - "%s" %s', ({name, description}) => {
      let result = adminQuizCreate(id, name, description);
>>>>>>> master
      expect(typeof result).toBe('object');
      expect(result).toEqual({
        quizId: expect.any(Number)
      });
      expect(result).not.toBeNull();
    });

    test('Invalid name - Name is already used by current logged in user', () => {
<<<<<<< HEAD
      let result1 = adminQuizCreate(id, 'Quiz Name', 'Description');
=======

      let result1 = adminQuizCreate(id, 'Quiz Name', 'Description');
      let result2 = adminQuizCreate(id, 'Quiz Name', 'Description');
>>>>>>> master

      expect(typeof result1).toBe('object');
      expect(result1).toEqual({
        quizId: expect.any(Number)
      });
      expect(result1).not.toBeNull();
      
<<<<<<< HEAD
      let result2 = adminQuizCreate(id.userId, 'Quiz Name', 'Description');
=======
      
>>>>>>> master
      expect(result2).toMatchObject({ error: expect.any(String) });
    });
  });
    
    describe('Test vadility of Description', () => {
      test('Invalid description - Description is more than 100 characters with normal spaces', () => {
<<<<<<< HEAD
        let result = adminQuizCreate(id.userId, 'Quiz Name', 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTU VWXYZ 123456 7890 ! @ # $ % ^ & * ( ) _ + - =');
=======
        let result = adminQuizCreate(id, 'Quiz Name', 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTU VWXYZ 123456 7890 ! @ # $ % ^ & * ( ) _ + - =');
>>>>>>> master
        expect(result).toMatchObject({ error: expect.any(String) });
      })

      test('Invalid description - Description is more than 100 characters with spaces at the front', () => {
<<<<<<< HEAD
        let result = adminQuizCreate(id.userId, 'Quiz Name', '  abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTUVWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =');
=======
        let result = adminQuizCreate(id, 'Quiz Name', '  abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTUVWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =');
>>>>>>> master
        expect(result).toMatchObject({ error: expect.any(String) });
      })

      test('Invalid description - Description is more than 100 characters with spaces at the end', () => {
<<<<<<< HEAD
        let result = adminQuizCreate(id.userId, 'Quiz Name', 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTUVWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =  ');
=======
        let result = adminQuizCreate(id, 'Quiz Name', 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTUVWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =  ');
>>>>>>> master
        expect(result).toMatchObject({ error: expect.any(String) });
      })
      
      test('Valid description - Empty string', () => {
<<<<<<< HEAD
        let result = adminQuizCreate(id.userId, 'Quiz Name', '');
=======
        let result = adminQuizCreate(id, 'Quiz Name', '');
>>>>>>> master
        expect(typeof result).toBe('object');
        expect(result).toEqual({
          quizId: expect.any(Number)
        });
        expect(result).not.toBeNull();
      })

      test('Valid description - Description with 100 characters', () => {
<<<<<<< HEAD
        let result = adminQuizCreate(id.userId, 'Quiz Name', 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTU VWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =');
=======
        let result = adminQuizCreate(id, 'Quiz Name', 'abcdefg hijklm nopq rstu vwxyz ABCDE FGHIJK LMNOPQ RSTU VWXYZ 1234567890 ! @ # $ % ^ & * ( ) _ + - =');
>>>>>>> master
        expect(typeof result).toBe('object');
        expect(result).toEqual({
          quizId: expect.any(Number)
        });
        expect(result).not.toBeNull();
      })
    })
});