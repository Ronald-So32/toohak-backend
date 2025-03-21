import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove
} from '../src/quiz.ts';
import { clear } from '../src/other.ts';
import { adminAuthRegister } from '../src/auth.ts';

let id;
let quizId, quizId2, quizId3;

// To clear existing data and register a user to create a quiz
beforeEach(() => {
  clear();
  id = adminAuthRegister('email@email.com', 'password1', 'first', 'last').userId;
  quizId = adminQuizCreate(id, 'Quiz name', 'Description').quizId;
});

describe('Tests for quiz list', () => {
  test('User Id invalid', () => {
    expect(adminQuizList(-1))
      .toStrictEqual({ error: expect.any(String) });
    expect(adminQuizList(id)).not.toBeNull();
  });

  test('User Id valid', () => {
    expect(typeof adminQuizList(id)).toBe('object');
    expect(adminQuizList(id)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz name',
        }
      ]
    });
    expect(adminQuizList(id)).not.toBeNull();
  });
});

describe('Valid User Id with multiple quizzes', () => {
  test('User Id valid', () => {
    quizId2 = adminQuizCreate(id, 'Quiz2 name', 'Description2').quizId;
    quizId3 = adminQuizCreate(id, 'Quiz3 name', 'Description3').quizId;
    // To make sure that all 3 quizzes exist in the list
    expect(typeof adminQuizList(id)).toBe('object');
    expect(adminQuizList(id)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz name',
        },
        {
          quizId: quizId2,
          name: 'Quiz2 name',
        },
        {
          quizId: quizId3,
          name: 'Quiz3 name',
        },
      ]
    });
    expect(adminQuizList(id)).not.toBeNull();
  });
});

describe('Valid User Id with multiple quizzes after removal', () => {
  test('User Id valid', () => {
    quizId2 = adminQuizCreate(id, 'Quiz2 name', 'Description2').quizId;
    quizId3 = adminQuizCreate(id, 'Quiz3 name', 'Description3').quizId;
    // Removes Quiz 2 from the data
    adminQuizRemove(id, quizId2);
    // To make sure that Quiz 2 doesn't exist in the list
    expect(typeof adminQuizList(id)).toBe('object');
    expect(adminQuizList(id)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz name',
        },
        {
          quizId: quizId3,
          name: 'Quiz3 name',
        },
      ]
    });
    expect(adminQuizList(id)).not.toBeNull();
  });
});
