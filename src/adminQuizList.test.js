import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove
} from './quiz';
import { clear } from './other.js';
import { adminAuthRegister } from './auth.js';

clear();
const id = adminAuthRegister('email@email.com', 'password1', 'first', 'last').userId;
const quizId = adminQuizCreate(id, 'Quiz name', 'Description').quizId;

describe('Tests for quiz list', () => {
  test('User Id invalid', () => {
    expect(adminQuizList(-1))
      .toStrictEqual({ error: expect.any(String) });
    expect(adminQuizList(id)).not.toBeNull();
  });

  test('User Id valid', () => {
    expect(adminQuizList(id)).toBe('object');
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

describe('Valid User Id with multiple quizzess', () => {
  const quizId2 = adminQuizCreate(id, 'Quiz2 name', 'Description2').quizId;
  const quizId3 = adminQuizCreate(id, 'Quiz3 name', 'Description3').quizId;

  test('User Id valid', () => {
    expect(adminQuizList(id)).toBe('object');
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

describe('Valid User Id with multiple quizzess', () => {
  const quizId2 = adminQuizCreate(id, 'Quiz2 name', 'Description2').quizId;
  const quizId3 = adminQuizCreate(id, 'Quiz3 name', 'Description3').quizId;
  adminQuizRemove(id, quizId2);

  test('User Id valid', () => {
    expect(adminQuizList(id)).toBe('object');
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
