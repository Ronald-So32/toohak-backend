import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizThumbnailUpdate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStatus,
  requestPlayerJoin
} from './testsHelper';

import {
  quizStates,
  idOffset,
  ErrorCodes
} from '../src/functionsHelper';

import { describe } from 'node:test';

// Define variables to store session token, IDs, and timestamps
let session: string;
let quizId: number;
let questionId: number;
let gameId: number;
let timeCreated: number;
let timeLastEdited: number;

// Before each test clears the data and sets up a quiz with a question,
// a game, and a player joining that game
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
  
  // Create a quiz for the logged-in user and store creation time
  const responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;

  // Create a question with thumbnail URL for the quiz
  const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
  questionId = responseQuestionCreate.body.questionId;
  
  // Update the quiz thumbnail and store the edit time
  requestAdminQuizThumbnailUpdate(
    quizId,
    session,
    'http://google.com/some/image/path.jpg'
  );
  timeLastEdited = Math.floor(Date.now() / 1000);

  // Start a new game for the quiz with autoStartNum of 3
  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  // Add a player to the game
  requestPlayerJoin(gameId, 'Name');
});

describe('Testing GET /v1/admin/quiz/{quizid}/game/{gameid}', () => {
  test('Testing the code 200 return value', () => {
    // Get the status of the current game
    const responseGetGame = requestAdminQuizGameStatus(
      quizId,
      gameId,
      session
    );
    
    // Verify that the game status response contains correct data
    // including the current state, question position, player list,
    // and all quiz metadata
    expect(responseGetGame.body).toStrictEqual({
      state: quizStates.LOBBY,
      atQuestion: 0,
      players: [
        'Name'
      ],
      metadata: {
        quizId: quizId,
        name: 'Name',
        timeCreated: timeCreated,
        timeLastEdited: timeLastEdited,
        description: 'Description',
        numQuestions: 1,
        questions: [
          {
            questionId: questionId,
            question: 'Who is the Monarch of England?',
            timeLimit: 4,
            thumbnailUrl: 'http://google.com/some/image/path.jpg',
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'Prince Charles',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Queen Elizibeth',
                colour: expect.any(String),
                correct: false
              }
            ]
          }
        ],
        timeLimit: 4,
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    });
    expect(responseGetGame.statusCode).toStrictEqual(ErrorCodes.OK);
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
        // Attempt to get game status with invalid session credentials
        const responseGetGame = requestAdminQuizGameStatus(
          quizId,
          gameId,
          session
        );
        
        // Verify that an unauthorized request returns an error
        expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGame.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        // Attempt to get game status for a non-existent quiz
        const responseGetGame = requestAdminQuizGameStatus(
          quizId + idOffset,
          gameId,
          session
        );
        
        // Verify that a forbidden request returns an error
        expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGame.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        // Register a second user who doesn't own the quiz
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        // Attempt to get game status for a quiz not owned by this user
        const responseGetGame = requestAdminQuizGameStatus(
          quizId,
          gameId,
          session
        );
        
        // Verify that a forbidden request returns an error
        expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGame.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });
    });

    test('Testing invalid game within quiz', () => {
      // Attempt to get status for a non-existent game
      const responseGetGame = requestAdminQuizGameStatus(
        quizId,
        gameId + idOffset,
        session
      );
      
      // Verify that an invalid game ID returns a bad request error
      expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });
  });
});

test('Testing GET /v1/admin/quiz/{quizid}/game/{gameid}  works as intended', () => {

});