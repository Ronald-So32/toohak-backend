import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestAdminQuizGameResults,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset,
  requestAdminQuizGameStatus
} from './testsHelper';

import { describe } from 'node:test';

const gameIdOffset = 727;

let session: string;
let quizId: number;
let questionId: number;
let gameId: number;
let timeCreated: number;
let timeLastEdited: number;

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
  timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;

  const reponseQuestionCreate = requestAdminQuizQuestionCreate(
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
        ]
      }
    }
  );
  questionId = reponseQuestionCreate.body.questionId
  timeLastEdited = Math.floor(Date.now() / 1000);

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;
  const responseStatus1 = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseStatus1.body.state).toStrictEqual("LOBBY");
  requestAdminQuizGameStateUpdate(quizId, gameId, session, "NEXT_QUESTION");
  const responseStatus2 = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseStatus2.body.state).toStrictEqual("QUESTION_COUNTDOWN");
  requestAdminQuizGameStateUpdate(quizId, gameId, session, "SKIP_COUNTDOWN");
  const responseStatus3 = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseStatus3.body.state).toStrictEqual("QUESTION_OPEN");
  requestAdminQuizGameStateUpdate(quizId, gameId, session, "GO_TO_ANSWER");
  const responseStatus4 = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseStatus4.body.state).toStrictEqual("ANSWER_SHOW");
  requestAdminQuizGameStateUpdate(quizId, gameId, session, "GO_TO_FINAL_RESULTS");
  const responseStatus5 = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseStatus5.body.state).toStrictEqual("FINAL_RESULTS");

});

describe('Testing GET /v1/admin/quiz/{quizid}/game/{gameid}/results', () => {
  test('Testing the code 200 return value', () => {
    const responseGetGameResult = requestAdminQuizGameResults(
      session,
      quizId,
      gameId,
    );
    expect(responseGetGameResult.body).toStrictEqual({
      usersRankedByScore: [],
      questionResults: [
        {
          questionId: questionId,
          playersCorrect: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
        }
      ]
    });
    expect(responseGetGameResult.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {

    test('Testing invalid game within quiz', () => {
      const responseGetGameResult = requestAdminQuizGameResults(
        session,
        quizId,
        gameId + gameIdOffset,
      );
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game hasn\'t ended', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responseGetGameResult = requestAdminQuizGameResults(
        session,
        quizId,
        gameId,
      );
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(BADREQUEST);
    });


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
        const responseGetGameResult = requestAdminQuizGameResults(
          session,
          quizId,
          gameId,
        );
        expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGameResult.statusCode).toStrictEqual(UNAUTHORISED);
      });
    })
  
    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseGetGameResult = requestAdminQuizGameResults(
          session,
          quizId + quizIdOffset,
          gameId,
        );
        expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGameResult.statusCode).toStrictEqual(FORBIDDEN);
      });
  
      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;
  
        const responseGetGameResult = requestAdminQuizGameResults(
          session,
          quizId,
          gameId,
        );
        expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGameResult.statusCode).toStrictEqual(FORBIDDEN);
      });
    })
  });
});
