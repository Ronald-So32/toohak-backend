import {
  adminQuizCreate,
  adminQuizDescriptionUpdate,
  adminQuizInfo,
  adminQuizList
} from '../src/quiz.ts';
import { adminAuthRegister } from '../src/auth.ts';
import { clear } from '../src/other.ts';

let id, quizId;

beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'Password1', 'First', 'Last').userId;
  quizId = adminQuizCreate(id, 'Quiz Name', 'Description').quizId;
});

describe('Test correct return type and normal usage case', () => {
  test('Test if the returned is object which is empty', () => {
    const result = adminQuizDescriptionUpdate(id, quizId, 'New Description');

    expect(typeof result).toBe('object');
    expect(result).toStrictEqual({});
    expect(result).not.toBeNull();
  });
});

describe('Test error cases', () => {
  test('Invalid userId - When id doesn\'t exist', () => {
    const result = adminQuizDescriptionUpdate(id + 999, quizId, 'New Description');

    expect(result).toStrictEqual({ error: expect.any(String) });

    // To make sure that it doe not change any existing quiz
    expect(typeof adminQuizInfo(id, quizId)).toBe('object');
    expect(adminQuizInfo(id, quizId)).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description'
    });
    expect(adminQuizInfo(id, quizId)).not.toBeNull();
  });

  test('Invalid quizId - When quiz doesn\'t exist', () => {
    const result = adminQuizDescriptionUpdate(id, quizId + 999, 'New Description');
    expect(result).toStrictEqual({ error: expect.any(String) });

    // To make sure that it does not change any exist quiz of the user
    expect(typeof adminQuizInfo(id, quizId)).toBe('object');
    expect(adminQuizInfo(id, quizId)).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description'
    });
    expect(adminQuizInfo(id, quizId)).not.toBeNull();
  });

  test('Invalid quizId - When quiz is not owned by user', () => {
    // Create a second user
    const userId2 = adminAuthRegister('email2@email.com', 'Password1', 'First', 'Last').userId;
    // Create a quiz for first user
    const quizId = adminQuizCreate(id, 'Quiz for Ownership Test', 'Description').quizId;

    // Try to update first user's quiz with second user's ID
    const result = adminQuizDescriptionUpdate(userId2, quizId, 'New Description');
    expect(result).toStrictEqual({ error: expect.any(String) });
  });

  // To test the validity of descriptions
  describe('Test validity of Description', () => {
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
      const quizId = adminQuizCreate(id, 'Quiz Name', 'valid description').quizId;
      const listBefore = adminQuizList(id);
      const infoBefore = adminQuizInfo(id, quizId);
      const result = adminQuizDescriptionUpdate(id, quizId, description);

      expect(result).toStrictEqual({ error: expect.any(String) });

      // To test that the quiz description didn't change
      expect(adminQuizList(id)).toStrictEqual(listBefore);
      expect(adminQuizInfo(id, quizId)).toStrictEqual(infoBefore);
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
      const result = adminQuizDescriptionUpdate(id, quizId, description);

      expect(typeof result).toBe('object');
      expect(result).toStrictEqual({});
      expect(result).not.toBeNull();

      // To make sure that description is actually updated
      expect(typeof adminQuizInfo(id, quizId)).toBe('object');
      expect(adminQuizInfo(id, quizId)).toStrictEqual({
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: description
      });

      expect(adminQuizInfo(id, quizId)).not.toBeNull();
    });
  });
});
