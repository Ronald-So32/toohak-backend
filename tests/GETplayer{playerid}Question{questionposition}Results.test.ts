import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestPlayerQuestionResults,
  requestPlayerQuestionInfo,
  requestPlayerAnswerSubmit
} from './testsHelper';

import {
  actions,
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';
import { answersInterface } from '../src/dataStore';

let session: string;
let quizId: number;
let questionId: number;
let gameId: number;
let playerId: number;
let currentAnswerOptions: answersInterface[];

// Before each test clears the existing data then registers an user creating a
// quiz with 2 question in it and starts a game with one player then gets the answerOptions.
// of the first question and changes the game state to ASNWER_SHOW
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

  currentAnswerOptions = requestPlayerQuestionInfo(playerId, 1).body.answerOptions;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);
});

describe('Testing GET /v1/player/{playerid}/question/{questionposition}/results', () => {
  test('Testing the code 200 return value', () => {
    // Gets the result of the question the game is on
    const requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
    // Checks that a valid request to get question results returns an object
    // with the results of the question and a status code of 200
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
      // Checks that a valid request to get question results returns an empty object
      // and a status code of 400
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

    test('Testing when game player is in ANSWER_SHOW state', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      playerId = responsePlayerJoin.body.playerId;

      let requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Updates the game state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);

      requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);

      requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Imports slync and then waits for 1 second to get to QUSETION_CLOSE state
      const slync = require('slync');
      slync(1000);

      requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);

      requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);

      requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid}/question/{questionposition}/results works as intended',
    () => {
      // Ends the game created before the teset
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);

      // Creates new game and adds 3 players to it
      gameId = requestAdminQuizGameStart(session, quizId, 5).body.gameId;

      playerId = requestPlayerJoin(
        gameId,
        'Name'
      ).body.playerId;

      const playerId2 = requestPlayerJoin(
        gameId,
        'Name2'
      ).body.playerId;

      const playerId3 = requestPlayerJoin(
        gameId,
        'Name3'
      ).body.playerId;

      // Get to the QUESTION_OPEN state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);

      let responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[0].answerId
          ]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({});
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);

      // Checks that a plater can update his answers
      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[1].answerId
          ]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({});
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);

      // Checks that a player can submit multiple answers
      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[1].answerId,
            currentAnswerOptions[0].answerId
          ]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({});
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);

      // Check that anotehr player can submit a answer
      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[0].answerId
          ]
        },
        playerId2,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({});
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);

      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[1].answerId,
            currentAnswerOptions[0].answerId
          ]
        },
        playerId3,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({});
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);

      // Check that a player can submit between other players submissions
      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[0].answerId
          ]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({});
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);

      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[1].answerId
          ]
        },
        playerId3,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({});
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);

      const slync = require('slync');
      slync(1000);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);

      // Gets the id of the current quiz
      const questionId = requestPlayerQuestionInfo(playerId, 1).body.questionId;

      // Checks the results of the current question to see that ther is submission
      const requestGetQuestionResult = requestPlayerQuestionResults(playerId, 1);
      expect(requestGetQuestionResult.body).toStrictEqual({
        questionId: questionId,
        playersCorrect: [
          'Name2',
          'Name'
        ],
        averageAnswerTime: 0,
        percentCorrect: 2 / 3 * 100,
      });
    });
});
