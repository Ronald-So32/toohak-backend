import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestPlayerQuestionResults
} from './testsHelper';

import {
  actions,
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
let questionId: number;
let gameId: number;
let playerId: number;

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

  const responseQuestionCreate = requestAdminQuizQuestionCreate(
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
  questionId = responseQuestionCreate.body.questionId;

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
        ]
      }
    }
  );

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );

  playerId = responsePlayerJoin.body.playerId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);
});

describe('Testing GET /v1/player/{playerid}/question/{questionposition}/results', () => {
  test('Testing the code 200 return value', () => {
    const requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
    expect(requestGetQuestionResult.body).toStrictEqual({
      questionId: questionId,
      playersCorrect: [],
      averageAnswerTime: expect.any(Number),
      percentCorrect: expect.any(Number)
    });
    expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const requestGetQuestionResult = requestPlayerQuestionResults(playerId + idOffset, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when question position given is not valid for the game', () => {
      const requestGetQuestionResult = requestPlayerQuestionResults(playerId, 3);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game is not currently on the question', () => {
      const requestGetQuestionResult = requestPlayerQuestionResults(playerId, 2);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid}/question/{questionposition}/results works as intended',
    () => {

    });
});
