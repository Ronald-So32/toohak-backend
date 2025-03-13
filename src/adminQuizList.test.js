import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove
} from './quiz.js';
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';

let id;
let quizId, quizId2, quizId3;

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
          quizId: expect.any(Number),
          name: 'Quiz name',
        }
      ]
    });
    expect(adminQuizList(id)).not.toBeNull();
  });
});

describe('Valid User Id with multiple quizzes', () => {
  beforeEach(() => {
    quizId2 = adminQuizCreate(id, 'Quiz2 name', 'Description2').quizId;
    quizId3 = adminQuizCreate(id, 'Quiz3 name', 'Description3').quizId;
  });

  test('User Id valid', () => {
    expect(typeof adminQuizList(id)).toBe('object');
    expect(adminQuizList(id)).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Quiz name',
        },
        {
          quizId: expect.any(Number),
          name: 'Quiz2 name',
        },
        {
          quizId: expect.any(Number),
          name: 'Quiz3 name',
        },
      ]
    });
    expect(adminQuizList(id)).not.toBeNull();
  });
});

describe('Valid User Id with multiple quizzes after removal', () => {
  beforeEach(() => {
    quizId2 = adminQuizCreate(id, 'Quiz2 name', 'Description2').quizId;
    quizId3 = adminQuizCreate(id, 'Quiz3 name', 'Description3').quizId;
    adminQuizRemove(id, quizId2);
  });

  test('User Id valid', () => {
    expect(typeof adminQuizList(id)).toBe('object');
    expect(adminQuizList(id)).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Quiz name',
        },
        {
          quizId: expect.any(Number),
          name: 'Quiz3 name',
        },
      ]
    });
    expect(adminQuizList(id)).not.toBeNull();
  });
});
