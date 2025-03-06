import { adminQuizList } from './quiz';

describe ('Tests for quiz list', () => {
  test('User Id invalid', () => {
    expect(adminQuizList(-1)).
    toEqual({error: 'User Id invalid'});
  });
    
  test('User Id valid', () => {
    expect(adminQuizList(1)).
      toEqual({ quizzes: [
        {
          quizId,
          name,
        }
      ]
      });
    });
  })