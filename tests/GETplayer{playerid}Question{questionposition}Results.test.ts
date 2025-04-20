import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestPlayerQuestionResults,
  OK,
  BADREQUEST
} from './testsHelper';

import { describe } from 'node:test';

const playerIdOffset = 727;

let session: string;
let quizId: number;
let questionId: number;
// let questionId2: number;
let gameId: number;
let playerId: number;
// let timeCreated: number;
// let timeLastEdited: number;

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
  // timeCreated = Math.floor(Date.now() / 1000);
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

  /* const responseQuestionCreate2 = */requestAdminQuizQuestionCreate(
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
  // questionId2 = responseQuestionCreate2.body.questionId;

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );

  playerId = responsePlayerJoin.body.playerId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'NEXT_QUESTION');
  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'SKIP_COUNTDOWN');
  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_ANSWER');
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
    expect(requestGetQuestionResult.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const requestGetQuestionResult = requestPlayerQuestionResults(playerId + playerIdOffset, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when question position given is not valid for the game', () => {
      const requestGetQuestionResult = requestPlayerQuestionResults(playerId, 3);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game is not currently on the question', () => {
      const requestGetQuestionResult = requestPlayerQuestionResults(playerId, 2);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid}/question/{questionposition}/results works as intended',
    () => {

    });
});
