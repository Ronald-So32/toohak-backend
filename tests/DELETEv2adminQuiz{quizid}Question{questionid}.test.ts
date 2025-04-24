import {
  requestClear,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestAdminQuizQuestionCreateV2,
  requestDeleteQuizQuestionV2,
  requestAdminQuizTransfer,
  requestGetQuizV2,
  requestAdminQuizGameStart,
  requestPlayerJoin,
  requestAdminQuizGameStateUpdate
} from './testsHelper';

import {
  idOffset,
  ErrorCodes
} from '../src/functionsHelper';

import { describe } from 'node:test';

// Define variables to store response objects, session tokens, and IDs
let responseQuizGet: responseInterface;
let session: string;
let quizId: number;
let questionId: number;
let timeCreated: number;
let timeEdited: number;

// Before each test clears the data then registers a user, gets the
// current session then creates a quiz and gets the quiz and question id
// with the quiz details
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

  // Create a question with thumbnail URL (v2 feature) for the quiz and store the question ID
  const responseQuestion = requestAdminQuizQuestionCreateV2(
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
  timeEdited = Math.floor(Date.now() / 1000);
  questionId = responseQuestion.body.questionId;

  // Get the current state of the quiz for comparison in tests
  responseQuizGet = requestGetQuizV2(quizId, session);
});

describe('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      // Deletes the question and gets the response
      const responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );

      // Checks that a valid deletion returns an empty object and a
      // status code of 200
      expect(responseQuestionDelete.body).toStrictEqual({});
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.OK);
    });
  });

  describe('Test error cases', () => {
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
        // Attempt to delete a question with invalid session credentials
        const responseQuestionDelete = requestDeleteQuizQuestionV2(
          quizId,
          questionId,
          session
        );

        // Checks that an unauthorised deletion returns an error object and a
        // status code of 401
        expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        // Attempt to delete a question from a non-existent quiz
        const responseQuestionDelete = requestDeleteQuizQuestionV2(
          quizId + idOffset,
          questionId,
          session
        );

        // Checks that a forbidden deletion returns an error object and a
        // status code of 403
        expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        // Register a new user to attempt unauthorized quiz access
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        // Attempt to delete a question from a quiz not owned by this user
        const responseQuestionDelete = requestDeleteQuizQuestionV2(
          quizId,
          questionId,
          session
        );

        // Verify error is returned with 403 status code
        expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });
    });

    test('Question id is invalid', () => {
      // Attempt to delete a non-existent question from an existing quiz
      const responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId + idOffset,
        session
      );

      // Checks that a invalid deletion returns an error object and a
      // status code of 400
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Check quiz has not been modified (question still exists)
      const responseQuizGet2 = requestGetQuizV2(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(ErrorCodes.OK);
    });

    test('Testing when any game for this quiz is not in END state', () => {
      // Starts a new game and gets the gameId
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;

      // Try to delete a question while game is in LOBBY state
      let responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Test deletion after changing to QUESTION_COUNTDOWN state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'NEXT_QUESTION');
      responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Test deletion after changing to QUESTION_OPEN state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'SKIP_COUNTDOWN');
      responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Test deletion after changing to ANSWER_SHOW state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_ANSWER');
      responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Test deletion after changing to FINAL_RESULTS state
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_FINAL_RESULTS');
      responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game is in END state', () => {
      // Start a game and immediately end it
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'END');

      // Verify question can be deleted when game is in END state
      const responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({});
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.OK);
    });
  });

  test('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid} works as intended', () => {
    // Registers a second user and gets their session token
    const responseRegister2 = requestAdminAuthRegister(
      'z6969@ad.unsw.edu.au',
      'Password2',
      'Firstt',
      'Lastt'
    );
    const session2 = responseRegister2.body.session;

    // Transfer ownership of the quiz from first user to second user
    const responseTransfer = requestAdminQuizTransfer(
      quizId,
      session,
      'z6969@ad.unsw.edu.au'
    );
    expect(responseTransfer.body).toStrictEqual({});
    expect(responseTransfer.statusCode).toStrictEqual(ErrorCodes.OK);

    // Verify first user can no longer access the quiz
    responseQuizGet = requestGetQuizV2(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);

    // Verify second user can access the quiz with the question
    responseQuizGet = requestGetQuizV2(quizId, session2);
    expect(responseQuizGet.body).toStrictEqual({
      description: 'Description',
      name: 'Name',
      quizId: 2,
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      numQuestions: 1,
      questions: [
        {
          questionId: 3,
          question: 'Who is the Monarch of England?',
          timeLimit: 4,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 5,
          answerOptions: [
            {
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
              answerId: 1,
            },
            {
              answer: 'Queen Elizibeth',
              colour: expect.any(String),
              correct: false,
              answerId: 2,
            },
          ],
        },
      ],
      timeLimit: 4,
    });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);

    // Start a game with a player and end it to allow question deletion
    const responseGameStart = requestAdminQuizGameStart(session2, quizId, 3);
    const gameId = responseGameStart.body.gameId;
    requestPlayerJoin(gameId, 'Name');
    requestAdminQuizGameStateUpdate(quizId, gameId, session2, 'END');

    // Second user deletes the question after game is ended
    const responseQuestionDelete = requestDeleteQuizQuestionV2(
      quizId,
      questionId,
      session2
    );
    timeEdited = Math.floor(Date.now() / 1000);
    expect(responseQuestionDelete.body).toStrictEqual({});
    expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.OK);

    // Verify the question is gone from the second user's quiz view
    responseQuizGet = requestGetQuizV2(quizId, session2);
    expect(responseQuizGet.body).toStrictEqual({
      quizId: 2,
      name: 'Name',
      description: 'Description',
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});
