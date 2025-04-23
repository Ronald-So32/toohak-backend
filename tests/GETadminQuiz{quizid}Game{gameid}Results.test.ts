import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestAdminQuizGameResults,
  requestPlayerAnswerSubmit,
  requestPlayerQuestionInfo,
  requestPlayerJoin
} from './testsHelper';

import {
  actions,
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

// Define variables to store session token and IDs
let session: string;
let quizId: number;
let questionId: number;
let gameId: number;

// Before each test clears the data then registers a user, creates a quiz with a question,
// starts a game, and moves the game to FINAL_RESULTS state
beforeEach(() => {
  // Reset the application state before each test
  requestClear();
  
  // Register a new admin user and extract the session token
  const responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  
  // Create a quiz for the logged-in user and extract the quiz ID
  const responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseCreate.body.quizId;

  // Create a question with thumbnail URL for the quiz
  const reponseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
  questionId = reponseQuestionCreate.body.questionId;

  // Start a game for the quiz with autoStartNum of 3
  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  // Move game through various states to FINAL_RESULTS
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);
});

describe('Testing GET /v1/admin/quiz/{quizid}/game/{gameid}/results', () => {
  test('Testing the code 200 return value', () => {
    // Get game results for a game in FINAL_RESULTS state
    const responseGetGameResult = requestAdminQuizGameResults(
      session,
      quizId,
      gameId
    );
    
    // Verify the response contains the expected data structure
    // with empty player list since no players joined
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
    expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    test('Testing invalid game within quiz', () => {
      // Attempt to get results for a non-existent game
      const responseGetGameResult = requestAdminQuizGameResults(
        session,
        quizId,
        gameId + idOffset
      );
      
      // Verify a bad request error is returned
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game hasn\'t ended', () => {
      // Start a new game that isn't in FINAL_RESULTS state
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      
      // Attempt to get results for a game not in FINAL_RESULTS state
      const responseGetGameResult = requestAdminQuizGameResults(
        session,
        quizId,
        gameId
      );
      
      // Verify a bad request error is returned
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    describe('Testing status code of 401 return values', () => {
      // Test multiple unauthorized scenarios using parametrized tests
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
        // Attempt to get game results with invalid session credentials
        const responseGetGameResult = requestAdminQuizGameResults(
          session,
          quizId,
          gameId
        );
        
        // Verify an unauthorized error is returned
        expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        // Attempt to get game results for a non-existent quiz
        const responseGetGameResult = requestAdminQuizGameResults(
          session,
          quizId + idOffset,
          gameId
        );
        
        // Verify a forbidden error is returned
        expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        // Register a second user who doesn't own the quiz
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        // Attempt to get game results for a quiz not owned by this user
        const responseGetGameResult = requestAdminQuizGameResults(
          session,
          quizId,
          gameId
        );
        
        // Verify a forbidden error is returned
        expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });
    });
  });
});

test('Testing GET /v1/admin/quiz/{quizid}/game/{gameid}/results works as intended', () => {
  // Ends the game created before the teset
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);

  // Creates new game and adds 3 players to it
  gameId = requestAdminQuizGameStart(session, quizId, 5).body.gameId;

  const playerId1 = requestPlayerJoin(
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

  const currentAnswerOptions = requestPlayerQuestionInfo(playerId1, 1).body.answerOptions;
  let responsePlayerSubmit = requestPlayerAnswerSubmit(
    {
      answerIds: [
        currentAnswerOptions[0].answerId
      ]
    },
    playerId1,
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
    playerId1,
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
    playerId1,
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
    playerId1,
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
  const questionId = requestPlayerQuestionInfo(playerId1, 1).body.questionId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);

  // Gets the final result of the game and checks taht the users ranks are correct
  // and question results
  const responseGetGameResult = requestAdminQuizGameResults(
    session,
    quizId,
    gameId
  );
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
        percentCorrect: Math.round(2 / 3 * 100),
      }
    ]
  });
  expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.OK);
});