import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestCSV,
  OK,
  BADREQUEST,
  FORBIDDEN,
  UNAUTHORISED
} from './testsHelper';

import { describe } from 'node:test';

// const gameIdOffset = 727727;
const playerIdOffset = 727727;

let session: string;
let quizId: number;
// let questionId: number;
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

  /* const responseQuestionCreate = */requestAdminQuizQuestionCreate(
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
  // questionId = responseQuestionCreate.body.questionId;
  // timeLastEdited = Math.floor(Date.now() / 1000);

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
  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_FINAL_RESULTS');
});

describe('Testing GET /v1/open/CSV', () => {
  test('Testing the code 200 return value', () => {
    const responseGetGameResult = requestCSV(playerId, quizId, session);
    expect(responseGetGameResult.body).toStrictEqual(
      'usersRankedByScore\n' +
      'playerName,score\n' +
      'Name,0\n\n' +
      'questionResults\n' +
      'questionId,playersCorrect,averageAnswerTime,percentCorrect\n' +
      '3,,0,0'
    );
    expect(responseGetGameResult.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when player does not exist in game', () => {
      const responseGetGameResult = requestCSV(playerId + playerIdOffset, quizId, session);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game player is in hasn\'t ended', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      playerId = responsePlayerJoin.body.playerId;
      const responseGetGameResult = requestCSV(playerId, quizId, session);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when the session is invalid', () => {
      const responseGetGameResult = requestCSV(playerId, quizId, session + 'Session Offset');
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when session is valid but not the owner of the quiz', () => {
      const responseRegister = requestAdminAuthRegister(
        'z7277f272@ad.unsw.edu.au',
        'Password1',
        'First',
        'Last'
      );
      session = responseRegister.body.session;

      const responseGetGameResult = requestCSV(playerId, quizId, session);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(FORBIDDEN);
    });
  });
});
