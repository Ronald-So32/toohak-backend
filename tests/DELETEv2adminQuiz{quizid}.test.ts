import {
  requestClear,
  requestAdminAuthRegister,
  requestDeleteQuizV2,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestGetQuizList,
  requestAdminQuizGameStart,
  requestPlayerJoin,
  requestAdminQuizGameStateUpdate,
  OK,
  BADREQUEST,
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
  requestAdminQuizQuestionCreateV2(
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
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
  );
});

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    // Deletes the quiz created by the current user and gets it's response
    const responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
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
        const responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
        // Checks that the response of an unauthorised quiz deletion returns an error object
        // and a status code of 401
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseDeleteQuiz = requestDeleteQuizV2(quizId + quizIdOffset, session);
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        // Checks that the response of an forbidden quiz deletion returns an error object
        // and a status code of 403
        expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;
        const responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
      });
    });

    test('Testing when any game for this quiz is not in END state', () => {
      // Starts a game
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      // Tries to delete a quiz when there is a game not in END state
      let responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      // Checks taht a invalid deltion of an quiz returns an error object and a
      // status code of 400
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

      // Updates the state of the game that started
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'NEXT_QUESTION');

      responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'SKIP_COUNTDOWN');

      responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_ANSWER');

      responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_FINAL_RESULTS');

      responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game is in END state', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'END');

      const responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({});
      expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);
    });
  });

  test('Testing DELETE /v2/admin/quiz/{quizid} works as intended', () => {
    // Get the quiz list of the current user to check that there is a quiz
    let responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Name'
        },
      ]
    });

    // Add another quiz
    const quizId2 = requestAdminQuizCreate(
      session,
      'Name2',
      'Description2'
    ).body.quizId;

    responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Name'
        },
        {
          quizId: quizId2,
          name: 'Name2'
        },
      ]
    });
    expect(responseList.statusCode).toStrictEqual(OK);

    // Starts a game with a player in it then updates to end state
    const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
    const gameId = responseGameStart.body.gameId;
    requestPlayerJoin(gameId, 'Name');
    requestAdminQuizGameStateUpdate(quizId, gameId, session, 'END');

    // Checks that a quiz can be deleted when there is a game and a player
    // during END state
    let responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);

    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);

    responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId2,
          name: 'Name2'
        }
      ]
    });

    responseDeleteQuiz = requestDeleteQuizV2(
      responseList.body.quizzes[0].quizId,
      session
    );
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);

    // Checks that the all quizzes are deleted
    responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({ quizzes: [] });
  });
});
