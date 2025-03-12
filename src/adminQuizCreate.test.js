import { adminQuizCreate, admiQuizList, adminQuizInfo } from './quiz.js';
import { adminAuthRegister } from './auth.js';
import { clear } from './other.js';

let id;

// To clear the datas and register a user before each test
beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned is object which has a quizId and quizId is a number and if quiz is sucessfully created', () => {
    // To get resulting return value of adminQuizCreate
    const result = adminQuizCreate(id, 'Quiz Name', 'Description');

    // Checking that the result is an object and that the field quizId is a Number
    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({
      quizId: result.quizId
    });

    // To ensure that result is not null
    expect(result).not.toBeNull();

    // To test if the quiz created is under the list of quiz the user has
    expect(adminQuizList(id)).toBe('object');
    expect(adminQuizList(id)).toStrictEqual({
      quizzes: [
        {
          quizId: result.quizId,
          name: expect.any(String),
        }
      ]
    });
    expect(adminQuizList(id)).not.toBeNull();

    // To test if the quiz created sucessfully pushes the information of the quiz
    expect(adminQuizInfo(id, result.quizId)).toBe('object');
    expect(adminQuizInfo(id, result.quizId)).toStrictEqual({
      quizId: result.quizId,
      name: 'Quiz Name',
      timeCreated: expect.any(Number).toBeLessThanOrEqual(Date.now()),
      timeLastEdited: expect.any(Number).toBeLessThanOrEqual(Date.now()),
      description: 'Description'
    });

    expect(adminQuizInfo(id, result.quizId)).not.toBeNull();
  });
});

// Test for basic error cases
describe('Test error cases', () => {
  // Using non-existent user to create quiz
  test('Invalid userId - When id doens\'t exist', () => {
    // To get the object containing the quizId made by a user which doesn't exist
    const result = adminQuizCreate(id + 999, 'Quiz Name', 'Description');

    expect(result).toStrictEqual({ error: expect.any(String) });

    // To test that no quizzes is created
    expect(adminQuizList).toStrictEqual({ quizzes: [] });
    expect(adminQuizInfo).toStrictEqual({});
  });

  // To test names which are valid and invalid
  describe('Test vadility of name', () => {
    // To test the invalid names
    test.each([
      {
        name: '@Quiz_Name!!!',
        description: 'Name contains invalid characters'
      },
      {
        name: 'Hi',
        description: 'Name is too short without spaces'
      },
      {
        name: ' I',
        description: 'Name is too short with spaces'
      },
      {
        name: '',
        description: 'Name is too short empty string'
      },
      {
        name: 'HiIamQuiz1234567890abcdefghijkl',
        description: 'Name is too long with no spaces'
      },
      {
        name: ' Hi I am Quiz 1234567890 abcdef',
        description: 'Name is too long with spaces at front'
      },
      {
        name: 'Hi I am Quiz 1234567890 abcdef ',
        description: 'Name is too long with spaces at end'
      },
      {
        name: 'Hi I am Quiz 123 456 7890 abc def',
        description: 'Name is too long with normal spaces'
      },
    ])('Invalid name - $description', ({ name, description }) => {
      const result = adminQuizCreate(id, name, description);

      expect(result).toStrictEqual({ error: expect.any(String) });

      // To test that no quizzes is created
      expect(adminQuizList).toStrictEqual({ quizzes: [] });
      expect(adminQuizInfo).toStrictEqual({});
    });

    // To test valid names
    test.each([
      {
        name: 'And',
        reason: 'Name has 3 more valid characters with no spaces'
      },
      {
        name: 'H i',
        reason: 'Name 1 with 3 more valid characters with spaces'
      },
      {
        name: ' Hi',
        reason: 'Name 2 with 3 more valid characters with spaces'
      },
      {
        name: 'Hi ',
        reason: 'Name 3 with 3 more valid characters with spaces'
      },
      {
        name: ' I ',
        reason: 'Name 4 with 3 more valid characters with spaces'
      },
      {
        name: 'HiIamQuiz1234567890abcdefghijk',
        reason: 'Name with 30 or less valid characters with no spaces'
      },
      {
        name: ' Hi I am Quiz 1234567890 abcde',
        reason: 'Name with 30 or less valid characters with spaces at front'
      },
      {
        name: 'Hi I am Quiz 1234567890 abcde ',
        reason: 'Name with 30 or less valid characters with spaces at end'
      },
      {
        name: 'Hi I am Quiz 12345 67890 abcde',
        reason: 'Name with 30 or less valid characters with normal spaces'
      },
    ])('Valid name - $reason', ({ name, reason }) => {
      const result = adminQuizCreate(id, name, 'Description');

      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({
        quizId: result.quizId
      });
      expect(result).not.toBeNull();

      // To test if the quiz created is under the list of quiz the user has
      expect(adminQuizList(id)).toBe('object');
      expect(adminQuizList(id)).toStrictEqual({
        quizzes: [
          {
            quizId: result1.quizId,
            name: name,
          }
        ]
      });
      expect(adminQuizList(id)).not.toBeNull();

      // To test if the quiz created sucessfully pushes the information of the quiz
      expect(adminQuizInfo(id, result.quizId)).toBe('object');
      expect(adminQuizInfo(id, result.quizId)).toStrictEqual({
        quizId: result1.quizId,
        name: name,
        timeCreated: expect.any(Number).toBeLessThanOrEqual(Date.now()),
        timeLastEdited: expect.any(Number).toBeLessThanOrEqual(Date.now()),
        description: 'Description'
      });
      expect(adminQuizInfo(id, result.quizId)).not.toBeNull();
    });

    // To test invalid name where name has been used once
    test('Invalid name - Name is already used by current logged in user', () => {
      // Tries to create two of the same quiz by same user
      const result1 = adminQuizCreate(id, 'Quiz Name', 'Description');
      const result2 = adminQuizCreate(id, 'Quiz Name', 'Description');

      expect(typeof result1).toBe('object');
      expect(result1).toStrictEqual({
        quizId: result1.quizId
      });
      expect(result1).not.toBeNull();

      // To test if the quiz created is under the list of quiz the user has
      expect(adminQuizList(id)).toBe('object');
      expect(adminQuizList(id)).toStrictEqual({
        quizzes: [
          {
            quizId: result1.quizId,
            name: 'Quiz Name',
          }
        ]
      });
      expect(adminQuizList(id)).not.toBeNull();

      // To test if the quiz created sucessfully pushes the information of the quiz
      expect(adminQuizInfo(id, result.quizId)).toBe('object');
      expect(adminQuizInfo(id, result.quizId)).toStrictEqual({
        quizId: result1.quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number).toBeLessThanOrEqual(Date.now()),
        timeLastEdited: expect.any(Number).toBeLessThanOrEqual(Date.now()),
        description: 'Description'
      });
      expect(adminQuizInfo(id, result.quizId)).not.toBeNull();

      expect(result2).toStrictEqual({ error: expect.any(String) });

      // To test that no quizzes is created
      expect(adminQuizList).toStrictEqual({ quizzes: [] });
      expect(adminQuizInfo).toStrictEqual({});
    });
  });

  // To test the vadility of descriptions
  describe('Test vadility of Description', () => {
    // To test the Invalid descriptions
    test.each([
      {
        description: 'ab 12 '.repeat(20) + '! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description is more than 100 characters with normal spaces'
      },
      {
        description: ' ab 12'.repeat(20) + '! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description is more than 100 characters with spaces at the front'
      },
      {
        description: 'aB 12 '.repeat(20) + '! @ # $ % ^ & * ( ) _ + - = ',
        reason: 'Description is more than 100 characters with spaces at the end'
      },
    ])('Invalid description - $reason', ({ description, reason }) => {
      const result = adminQuizCreate(id, 'Quiz Name', description);

      expect(result).toStrictEqual({ error: expect.any(String) });

      // To test that no quizzes is created
      expect(adminQuizList).toStrictEqual({ quizzes: [] });
      expect(adminQuizInfo).toStrictEqual({});
    });

    // To test valid descriptions
    test.each([
      {
        description: '',
        reason: 'Empty string'
      },
      {
        description: 'aB 12 '.repeat(12) + ' ! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description with 100 characters'
      },
    ])('Valid description - $reason', ({ description, reason }) => {
      const result = adminQuizCreate(id, 'Quiz Name', description);
      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({
        quizId: result.quizId
      });

      expect(result).not.toBeNull();

      // To test if the quiz created is under the list of quiz the user has
      expect(adminQuizList(id)).toBe('object');
      expect(adminQuizList(id)).toStrictEqual({
        quizzes: [
          {
            quizId: result.quizId,
            name: 'Quiz Name',
          }
        ]
      });
      expect(adminQuizList(id)).not.toBeNull();

      // To test if the quiz created sucessfully pushes the information of the quiz
      expect(adminQuizInfo(id, result.quizId)).toBe('object');
      expect(adminQuizInfo(id, result.quizId)).toStrictEqual({
        quizId: result.quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number).toBeLessThanOrEqual(Date.now()),
        timeLastEdited: expect.any(Number).toBeLessThanOrEqual(Date.now()),
        description: 'Description'
      });
      expect(adminQuizInfo(id, result.quizId)).not.toBeNull();
    });
  });
});
