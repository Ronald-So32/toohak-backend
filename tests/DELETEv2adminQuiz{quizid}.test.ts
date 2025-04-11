import {
  requestClear,
  requestAdminAuthRegister,
  requestDeleteQuiz,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  // requestAdminStartGame,
  // requestPlayerJoin,
  // requestAdminUpdateGame,
  OK,
  // BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;

// Before each test clears the data and registers a user, obtaining it's
// session and creates a quiz for the user, obtaining the quiz id for it
beforeEach(() => {
  requestClear();
  const responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  const responseQuizCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseQuizCreate.body.quizId;
  requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Who is the Queen of England?',
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
        // thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
  );
});

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    // Deletes the quiz created by the current user and gets it's response
    const responseDeleteQuiz = requestDeleteQuiz(quizId, session);
    // Checks that the response of the quiz deletion returns an empty object
    // and a status code of 200
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);
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
        const responseDeleteQuiz = requestDeleteQuiz(quizId, session);
        // Checks that the response of an unauthorised quiz deletion returns an error object
        // and a status code of 401
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseDeleteQuiz = requestDeleteQuiz(quizId + quizIdOffset, session);
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;
        const responseDeleteQuiz = requestDeleteQuiz(quizId, session);
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
      });
    });
    /*
    test('Testing when any game for this quiz is not in END state', () => {
      const responseGameStart = requestAdminStartGame(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      let responseDeleteQuiz = requestDeleteQuiz(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

      requestAdminUpdateGame(quizId, gameId, session, 'NEXT_QUESTION');

      responseDeleteQuiz = requestDeleteQuiz(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

      requestAdminUpdateGame(quizId, gameId, session, 'SKIP_COUNTDOWN');

      responseDeleteQuiz = requestDeleteQuiz(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

      requestAdminUpdateGame(quizId, gameId, session, 'GO_TO_ANSWER');

      responseDeleteQuiz = requestDeleteQuiz(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

      requestAdminUpdateGame(quizId, gameId, session, 'GO_TO_FINAL_RESULTS');

      responseDeleteQuiz = requestDeleteQuiz(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

    });

    test('Testing when game is in END state', () => {
      const responseGameStart = requestAdminStartGame(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      requestAdminUpdateGame(quizId, gameId, session, 'END');

      const  responseDeleteQuiz = requestDeleteQuiz(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);
    });
  */
  });

  test('Testing DELETE /v2/admin/quiz/{quizid} works as intended', () => {

  });
});
