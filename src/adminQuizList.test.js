import { adminQuizList, adminQuizCreate } from './quiz';
import { clear } from './other.js';
import { authAdminRegister } from './auth.js';


describe ('Tests for quiz list', () => {

  clear();
  let id = authAdminRegister('email@email.com', 'password1', 'first', 'last').userId;
  let quizId = adminQuizCreate(id, 'Quiz name', 'Description').quizId;

  test('User Id invalid', () => {
    expect(adminQuizList(-1)).
    toStrictEqual({error: expect.any(String)});
    expect(adminQuizList(id)).not.toBeNull();
  });
    
  test('User Id valid', () => {
    expect(adminQuizList(id)).toBe('object');
    expect(adminQuizList(id)).toStrictEqual({ quizzes: [
        {
          quizId: quizId,
          name: 'Quiz name',
        }
      ]
      });
      expect(adminQuizList(id)).not.toBeNull();
    });
  })