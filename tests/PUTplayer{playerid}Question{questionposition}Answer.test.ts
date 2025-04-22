import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestPlayerQuestionInfo,
  requestPlayerAnswerSubmit,
  requestPlayerQuestionResults
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
let gameId: number;
let playerId: number;
let currentAnswerOptions: answersInterface[];

// Before each test clears the existing data then registers an user creating a
// quiz with 2 questions in it and starts a game with one player then opens the
// first question and gets its answerOptions.
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
        timeLimit: 1,
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
        timeLimit: 1,
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
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
  currentAnswerOptions = requestPlayerQuestionInfo(playerId, 1).body.answerOptions;
});

describe('Testing GET /v1/player/{playerid}', () => {
  test('Testing the code 200 return value', () => {
    // Submits a answer for the current questions
    const responsePlayerSubmit = requestPlayerAnswerSubmit(
      {
        answerIds: [currentAnswerOptions[0].answerId]
      },
      playerId,
      1
    );
    // Checks that a valid submission returns an empty object and a status code
    // of 200
    expect(responsePlayerSubmit.body).toStrictEqual({});
    expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId + idOffset,
        1
      );
      // Checks that a invalid submission returns an error object and a status code
      // of 400
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when question position given is not valid for the game', () => {
      const responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId,
        3
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game is not in QUESTION_OPEN state', () => {
      // Ends the game created before the test
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);

      // Starts a new game with a player
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      playerId = responsePlayerJoin.body.playerId;

      let responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Updates the game state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);

      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
      // Imports slync and then waits for 1 second to get to QUSETION_CLOSE state
      const slync = require('slync');
      slync(1000);

      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);

      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);

      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);

      responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game is not currently on the question', () => {
      const responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId]
        },
        playerId,
        2
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when answer is not valid for this particular question', () => {
      const responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [currentAnswerOptions[0].answerId + idOffset]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when duplicate answerId provdied', () => {
      const responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[0].answerId,
            currentAnswerOptions[0].answerId
          ]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when multiple non-duplicate answerId provdied', () => {
      const responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: [
            currentAnswerOptions[0].answerId,
            currentAnswerOptions[1].answerId
          ]
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({});
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.OK);
    });

    test('Testing when less then 1 answer was submitted', () => {
      const responsePlayerSubmit = requestPlayerAnswerSubmit(
        {
          answerIds: []
        },
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid} works as intended', () => {
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
