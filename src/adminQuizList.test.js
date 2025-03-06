import { adminQuizList, adminQuizCreate } from './quiz';
import { clear } from './other.js';
import { authAdminRegister } from './auth.js';


describe ('Tests for quiz list', () => {

  clear();
  let id = authAdminRegister('email@email.com', 'password1', 'first', 'last');
  adminQuizCreate(id, 'Quiz name', 'Description');

  test('User Id invalid', () => {
    expect(adminQuizList(-1)).
    toEqual({error: 'User Id invalid'});
  });
    
  test('User Id valid', () => {
    expect(adminQuizList(id)).
      toEqual({ quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Quiz name',
        }
      ]
      });
    });
  })