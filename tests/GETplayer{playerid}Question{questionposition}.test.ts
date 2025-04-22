import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestPlayerQuestionInfo
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

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );

  playerId = responsePlayerJoin.body.playerId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'NEXT_QUESTION');
  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'SKIP_COUNTDOWN');
});

describe('Testing GET /v1/player/{playerid}', () => {
  test('Testing the code 200 return value', () => {
    const requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 1);
    expect(requestGetPlayerQuestion.body).toStrictEqual({
      questionId: questionId,
      question: 'Who is the Monarch of England?',
      timeLimit: 4,
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
      points: 5,
      answerOptions: [
        {
          answerId: expect.any(Number),
          answer: 'Prince Charles',
          colour: expect.any(String)
        },
        {
          answerId: expect.any(Number),
          answer: 'Queen Elizibeth',
          colour: expect.any(String)
        }
      ]
    });
    expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId + idOffset, 1);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when question position given is not valid for the game', () => {
      const requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 3);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game is not currently on the question', () => {
      const requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 2);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game player is in a invalid state', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      playerId = responsePlayerJoin.body.playerId;

      let requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 1);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Updates the game state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);

      requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 1);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);

      // Imports slync and then waits for 1 second to get to QUSETION_CLOSE state
      const slync = require('slync');
      slync(1000);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);
      
      requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 1);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);
      
      requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 1);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game player is in a valid state', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      playerId = responsePlayerJoin.body.playerId;

      // Updates the game state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);

      let requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 1);
      expect(requestGetPlayerQuestion.body).toStrictEqual({
        questionId: questionId,
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
        points: 5,
        answerOptions: [
          {
            answerId: expect.any(Number),
            answer: 'Prince Charles',
            colour: expect.any(String)
          },
          {
            answerId: expect.any(Number),
            answer: 'Queen Elizibeth',
            colour: expect.any(String)
          }
        ]
      });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.OK);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);
      
      requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 1);
      expect(requestGetPlayerQuestion.body).toStrictEqual({
        questionId: questionId,
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
        points: 5,
        answerOptions: [
          {
            answerId: expect.any(Number),
            answer: 'Prince Charles',
            colour: expect.any(String)
          },
          {
            answerId: expect.any(Number),
            answer: 'Queen Elizibeth',
            colour: expect.any(String)
          }
        ]
      });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(ErrorCodes.OK);
    });

  });

  test('Testing GET /v1/player/{playerid} works as intended', () => {

  });
});
