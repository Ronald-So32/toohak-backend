import {
  requestClear,
  requestAdminAuthRegister,
  //responseInterface,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGamesList,
  //requestAdminUpdateGame,
  OK,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;

beforeEach(() => {
  requestClear();
  const responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  const responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseCreate.body.quizId;

  requestAdminQuizQuestionCreateV2(
    quizId,
    session,
    {
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'Queen Elizibeth',
            correct: false
          }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
  );
});

describe('Testing GET /v1/admin/quiz/{quizid}/games', () => {
  test('Testing the code 200 return value', () => {
    const responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing status code of 401 return values', () => {
      test.each([
        {
          session: session + 'Invalid Session',
          description: 'Invalid session',
        },
        {
          session: '',
          description: 'Empty session',
        }
      ])('$description', ({ session }) => {
        const responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
        expect(responseGetQuizGames.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetQuizGames.statusCode).toStrictEqual(UNAUTHORISED);
      });
    })

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseGetQuizGames = requestAdminQuizGamesList(session, quizId + quizIdOffset);
        expect(responseGetQuizGames.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetQuizGames.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        const responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
        expect(responseGetQuizGames.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetQuizGames.statusCode).toStrictEqual(FORBIDDEN);
      });
    })
  });

  test('Testing GET /v1/admin/quiz/{quizid}/games works as intended', () => {
    const responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(OK);

    const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
    expect(responseGameStart.body).toStrictEqual({ gameId: expect.any(Number) });
    expect(responseGameStart.statusCode).toStrictEqual(OK);
    
    const responseGetQuizGames2 = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames2.body).toStrictEqual({
      activeGames: [quizId],
      inactiveGames: []
    });
    expect(responseGetQuizGames2.statusCode).toStrictEqual(OK);

  });
});
