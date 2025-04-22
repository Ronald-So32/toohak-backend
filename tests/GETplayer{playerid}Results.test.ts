import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestPlayerFinalResults,
  requestPlayerQuestionInfo,
  requestPlayerQuestionResults,
  requestPlayerAnswerSubmit
} from './testsHelper';

import {
  actions,
  quizStates,
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

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );
  playerId = responsePlayerJoin.body.playerId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'NEXT_QUESTION');
  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'SKIP_COUNTDOWN');

  currentAnswerOptions = requestPlayerQuestionInfo(playerId, 1).body.answerOptions;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_ANSWER');
  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_FINAL_RESULTS');
});

describe('Testing GET /v1/admin/quiz/{quizid}/games', () => {
  test('Testing the code 200 return value', () => {
    const responseGetGameResult = requestPlayerFinalResults(playerId);
    expect(responseGetGameResult.body).toStrictEqual({
      usersRankedByScore: [
        {
          playerName: 'Name',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId,
          playersCorrect: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: expect.any(Number)
        }
      ]
    });
    expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when player does not exist in game', () => {
      const responseGetGameResult = requestPlayerFinalResults(playerId + idOffset);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game player is in hasn\'t ended', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      playerId = responsePlayerJoin.body.playerId;
      const responseGetGameResult = requestPlayerFinalResults(playerId);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });
  });
});
test('Testing GET /v1/player/{playerid} works as intended', () => {
    // Ends the game created before the teset
    requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);

    // Creates new game and adds 3 players to it
    gameId = requestAdminQuizGameStart(session, quizId, 5).body.gameId;

    playerId  = requestPlayerJoin(
      gameId,
      'Name'
    ).body.playerId;

    const playerId2  = requestPlayerJoin(
      gameId,
      'Name2'
    ).body.playerId;

    const playerId3  = requestPlayerJoin(
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
      percentCorrect: 2/3 * 100,
    });

    requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);

    const responseGetGameResult = requestPlayerFinalResults(playerId);
    expect(responseGetGameResult.body).toStrictEqual({
      usersRankedByScore: [
        {
          playerName: 'Name2',
          score: 5
        },
        {
          playerName: 'Name',
          score: 2.5
        },
        {
          playerName: 'Name3',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId,
          playersCorrect: [
            'Name2',
            'Name'
          ],
          averageAnswerTime: 0,
          percentCorrect: Math.ceil(2/3 * 100),
        }
      ]
    });
    expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.OK);

  });