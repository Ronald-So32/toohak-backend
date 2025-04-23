import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGamesList,
  requestAdminQuizGameStateUpdate
} from './testsHelper';

import {
  actions,
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

// Define variables to store session token and quiz ID
let session: string;
let quizId: number;

// Before each test clears the data then registers a user, creates a quiz with a question
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
});

describe('Testing GET /v1/admin/quiz/{quizid}/games', () => {
  test('Testing the code 200 return value', () => {
    // Get list of games for a quiz with no games
    const responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    
    // Verify the response contains empty active and inactive games arrays
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
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
        // Attempt to get games list with invalid session credentials
        const responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
        
        // Verify an unauthorized error is returned
        expect(responseGetQuizGames.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        // Attempt to get games list for a non-existent quiz
        const responseGetQuizGames = requestAdminQuizGamesList(session, quizId + idOffset);
        
        // Verify a forbidden error is returned
        expect(responseGetQuizGames.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        // Register a second user who doesn't own the quiz
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        // Attempt to get games list for a quiz not owned by this user
        const responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
        
        // Verify a forbidden error is returned
        expect(responseGetQuizGames.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });
    });
  });

  test('Testing GET /v1/admin/quiz/{quizid}/games works as intended', () => {
    // Verify quiz initially has no games
    let responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);

    // Start two games for the quiz
    const gameId1 = requestAdminQuizGameStart(session, quizId, 3).body.gameId;
    const gameId2 = requestAdminQuizGameStart(session, quizId, 3).body.gameId;

    // Verify both games are in the activeGames list
    responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [
        gameId1,
        gameId2
      ],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);

    // Move game1 to QUESTION_COUNTDOWN state
    requestAdminQuizGameStateUpdate(quizId, gameId1, session, actions.NEXT_QUESTION);

    // Verify game is still active in QUESTION_COUNTDOWN state
    responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [
        gameId1,
        gameId2
      ],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);

    // Move game1 to QUESTION_OPEN state
    requestAdminQuizGameStateUpdate(quizId, gameId1, session, actions.SKIP_COUNTDOWN);

    // Verify game is still active in QUESTION_OPEN state
    responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [
        gameId1,
        gameId2
      ],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);

    // Wait for a second (possibly to allow for state transitions)
    const slync = require('slync');
    slync(1000);

    // Verify games are still active after waiting
    responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [
        gameId1,
        gameId2
      ],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);

    // Move game1 to ANSWER_SHOW state
    requestAdminQuizGameStateUpdate(quizId, gameId1, session, actions.GO_TO_ANSWER);

    // Verify game is still active in ANSWER_SHOW state
    responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [
        gameId1,
        gameId2
      ],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);

    // Move game1 to FINAL_RESULTS state
    requestAdminQuizGameStateUpdate(quizId, gameId1, session, actions.GO_TO_FINAL_RESULTS);

    // Verify game is still active in FINAL_RESULTS state
    responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [
        gameId1,
        gameId2
      ],
      inactiveGames: []
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);

    // Move game1 to END state
    requestAdminQuizGameStateUpdate(quizId, gameId1, session, actions.END);

    // Verify game1 has moved to inactiveGames list and game2 remains active
    responseGetQuizGames = requestAdminQuizGamesList(session, quizId);
    expect(responseGetQuizGames.body).toStrictEqual({
      activeGames: [
        gameId2
      ],
      inactiveGames: [
        gameId1
      ]
    });
    expect(responseGetQuizGames.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});