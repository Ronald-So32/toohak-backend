import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestAdminQuizGameStatus,
  requestPlayerJoin
} from './testsHelper';

import {
  quizStates,
  actions,
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
let gameId: number;

// Before each test clears the data stored and registers a new user and creates
// a quiz and a question then starts a game, and obtains the user session and all the ids
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

  requestAdminQuizQuestionCreate(
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

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;
});

describe('Testing GET /v1/admin/quiz/{quizid}/games', () => {
  test('Testing the code 200 return value', () => {
    // Adds a player to a game
    const responsePlayerJoin = requestPlayerJoin(
      gameId,
      'Name'
    );
    // Checks that a valid request to add player returns an empty object
    // and a status code of 200
    expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(Number) });
    expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    test('Testing invalid player name', () => {
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'name!@#$%^&*()_+'
      );
      // Checks that a invalid request to add player returns an error object
      // and a status code of 400
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing player name entered is not unique', () => {
      let responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(Number) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.OK);

      responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing invalid game within quiz', () => {
      const responsePlayerJoin = requestPlayerJoin(
        gameId + idOffset,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game state is not in LOBBY', () => {
      // Updates the game state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);

      let responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
      // Imports slync and then waits for 1 second to get to QUSETION_CLOSE state
      const slync = require('slync');
      slync(1000);

      responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);

      responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);

      responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);

      responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing player name is empty', () => {
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        ''
      );
      expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(Number) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.OK);
    });

    test('Testing the auto start feature of a game', () => {
      let responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
      expect(responseGameStatus.body.state).toStrictEqual(quizStates.LOBBY);

      let responsePlayerJoin = requestPlayerJoin(
        gameId,
        ''
      );
      expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(Number) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.OK);

      responsePlayerJoin = requestPlayerJoin(
        gameId,
        ''
      );
      expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(Number) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.OK);

      responsePlayerJoin = requestPlayerJoin(
        gameId,
        ''
      );
      expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(Number) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(ErrorCodes.OK);

      responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
      expect(responseGameStatus.body.state).toStrictEqual(quizStates.QUESTION_COUNTDOWN);
    });
  });
});
