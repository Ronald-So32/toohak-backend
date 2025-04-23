import {
  requestClear,
  requestAdminAuthRegister,
  requestDeleteQuizV2,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestGetQuizList,
  requestAdminQuizGameStart,
  requestPlayerJoin,
  requestAdminQuizGameStateUpdate
} from './testsHelper';

import {
  idOffset,
  ErrorCodes
} from '../src/functionsHelper';

import { describe } from 'node:test';

// Define variables to store session token and quiz ID
let session: string;
let quizId: number;

// Before each test clears the data and registers a user, obtaining it's
// session and creates a quiz for the user, obtaining the quiz id for it
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
  const responseQuizCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseQuizCreate.body.quizId;
  
  // Create a question for the quiz with a thumbnail URL (v2 feature)
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
});

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    // Deletes the quiz created by the current user and gets it's response
    const responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
    
    // Checks that the response of the quiz deletion returns an empty object
    // and a status code of 200
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.OK);
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
        // Attempt to delete a quiz with invalid session credentials
        const responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
        
        // Checks that the response of an unauthorised quiz deletion returns an error object
        // and a status code of 401
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        // Attempt to delete a non-existent quiz
        const responseDeleteQuiz = requestDeleteQuizV2(quizId + idOffset, session);
        
        // Checks that the response of an forbidden quiz deletion returns an error object
        // and a status code of 403
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        // Register a second user and get their session token
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;
        
        // Attempt to delete a quiz not owned by the second user
        const responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
        
        // Verify that an error is returned with 403 status code
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });
    });

    test('Testing when any game for this quiz is not in END state', () => {
      // Starts a game for the quiz
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      
      // Tries to delete a quiz when there is a game not in END state
      let responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      
      // Checks that a invalid deletion of a quiz returns an error object and a
      // status code of 400
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Test deletion after changing to QUESTION_COUNTDOWN state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'NEXT_QUESTION');
      responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Test deletion after changing to QUESTION_OPEN state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'SKIP_COUNTDOWN');
      responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Test deletion after changing to ANSWER_SHOW state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_ANSWER');
      responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Test deletion after changing to FINAL_RESULTS state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_FINAL_RESULTS');
      responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game is in END state', () => {
      // Starts a game for the quiz
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      
      // Change game state to END
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'END');

      // Verify that quiz can be deleted when the game is in END state
      const responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({});
      expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.OK);
    });
  });

  test('Testing DELETE /v2/admin/quiz/{quizid} works as intended', () => {
    // Get the quiz list of the current user to check that there is a quiz
    let responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Name'
        },
      ]
    });

    // Add another quiz to the user's list
    const quizId2 = requestAdminQuizCreate(
      session,
      'Name2',
      'Description2'
    ).body.quizId;

    // Verify the user now has two quizzes
    responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Name'
        },
        {
          quizId: quizId2,
          name: 'Name2'
        },
      ]
    });
    expect(responseList.statusCode).toStrictEqual(ErrorCodes.OK);

    // Start a game with a player and then end the game
    const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
    const gameId = responseGameStart.body.gameId;
    requestPlayerJoin(gameId, 'Name');
    requestAdminQuizGameStateUpdate(quizId, gameId, session, 'END');

    // Checks that a quiz can be deleted when there is a game and a player
    // during END state
    let responseDeleteQuiz = requestDeleteQuizV2(quizId, session);
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.OK);

    // Verify that only the second quiz remains
    responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId2,
          name: 'Name2'
        }
      ]
    });

    // Delete the second quiz
    responseDeleteQuiz = requestDeleteQuizV2(
      responseList.body.quizzes[0].quizId,
      session
    );
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(ErrorCodes.OK);

    // Checks that the all quizzes are deleted
    responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({ quizzes: [] });
  });
});