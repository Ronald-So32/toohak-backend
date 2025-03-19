import {
  adminQuizCreate,
  adminQuizNameUpdate,
  adminQuizList,
  adminQuizInfo
} from '../src/quiz.ts';
import { adminAuthRegister } from '../src/auth.ts';
import { clear } from '../src/other.ts';

let userId;
let quizId;

beforeEach(() => {
  clear();
  userId = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
  quizId = adminQuizCreate(userId, 'Quiz Name', 'Description').quizId;
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned is object which is empty', () => {
    const result = adminQuizNameUpdate(userId, quizId, 'New Quiz Name');
    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({});
    expect(result).not.toBeNull();
  });
});

describe('Test error cases', () => {
  test('Invalid userId - When id doesn\'t exist', () => {
    const result = adminQuizNameUpdate(userId + 999, quizId, 'New Quiz Name');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid quizId - When quiz doesn\'t exist', () => {
    const result = adminQuizNameUpdate(userId, quizId + 999, 'New Quiz Name');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  test('Invalid quizId - When quiz is not owned by user', () => {
    // Create a second user
    const userId2 = adminAuthRegister('email2@email.com', 'Password1', 'First', 'Last').userId;
    // Create a quiz for second user
    adminQuizCreate(userId2, 'Quiz Name 2', 'Description');

    // Try to update first user's quiz with second user's ID
    const result = adminQuizNameUpdate(userId2, quizId, 'New Quiz Name');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  describe('Test validity of name', () => {
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
      const listBefore = adminQuizList(userId);
      const infoBefore = adminQuizInfo(userId, quizId);
      const result = adminQuizNameUpdate(userId, quizId, name);

      expect(result).toStrictEqual({ error: expect.any(String) });

      // To test that the quiz name didn't change
      expect(adminQuizList(userId)).toStrictEqual(listBefore);
      expect(adminQuizInfo(userId, quizId)).toStrictEqual(infoBefore);
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
      const result = adminQuizNameUpdate(userId, quizId, name);

      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({});
      expect(result).not.toBeNull();

      // To make sure that the name of quiz updates
      expect(adminQuizList(userId)).toStrictEqual({
        quizzes: [
          {
            quizId: quizId,
            name: name,
          }
        ]
      });
      expect(adminQuizInfo(userId, quizId)).toStrictEqual({
        quizId: quizId,
        name: name,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Description'
      });
    });

    test('Invalid name - Name is already used by current logged in user', () => {
      // Create another quiz with a different name
      const anotherQuizId = adminQuizCreate(userId, 'Another Quiz', 'Description').quizId;

      // Try to update the name of this quiz to the name of the first quiz
      const result = adminQuizNameUpdate(userId, anotherQuizId, 'Quiz Name');

      expect(result).toStrictEqual({ error: expect.any(String) });
    });
  });
});
