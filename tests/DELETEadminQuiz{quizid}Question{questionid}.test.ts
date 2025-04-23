import {
  requestClear,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestAdminQuizQuestionCreate,
  requestDeleteQuizQuestion,
  requestAdminQuizTransfer,
  requestGetQuiz
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

  // Create a quiz for the logged-in user and extract the quiz ID
  const responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;

  // Create a question for the quiz and extract the question ID
  const responseQuestion = requestAdminQuizQuestionCreate(
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
  timeEdited = Math.floor(Date.now() / 1000);
  questionId = responseQuestion.body.questionId;

  // Get the current state of the quiz for comparison in tests
  responseQuizGet = requestGetQuiz(quizId, session);
});

describe('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      // Deletes the question and gets the response
      const responseQuestionDelete = requestDeleteQuizQuestion(
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
    test('Session is invalid', () => {
      // Attempt to delete a question with an invalid session token
      const responseQuestionDelete = requestDeleteQuizQuestion(
        quizId,
        questionId,
        session + 'Invalid Session'
      );

      // Checks that an unauthorised deletion returns an error object and a
      // status code of 401
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);

      // Check quiz has not been modified (question still exists)
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(ErrorCodes.OK);
    });

    test('Quiz id is invalid', () => {
      // Attempt to delete a question from a non-existent quiz
      const responseQuestionDelete = requestDeleteQuizQuestion(
        quizId + idOffset,
        questionId,
        session
      );

      // Checks that a forbidden deletion returns an error object and a
      // status code of 403
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);

      // Check quiz has not been modified (question still exists)
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(ErrorCodes.OK);
    });

    test('Question id is invalid', () => {
      // Attempt to delete a non-existent question from an existing quiz
      const responseQuestionDelete = requestDeleteQuizQuestion(
        quizId,
        questionId + idOffset,
        session
      );

      // Checks that an invalid question deletion returns an error object and a
      // status code of 400
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

      // Check quiz has not been modified (question still exists)
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(ErrorCodes.OK);
    });
  });

  test('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid} works as intended', () => {
    // Registers a second user and gets its session token
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
    responseQuizGet = requestGetQuiz(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);

    // Verify second user can access the quiz with the question
    responseQuizGet = requestGetQuiz(quizId, session2);
    expect(responseQuizGet.body).toStrictEqual({
      description: 'Description',
      name: 'Name',
      numQuestions: 1,
      questions: [
        {
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
          points: 5,
          question: 'Who is the Monarch of England?',
          questionId: 3,
          timeLimit: 4,
        },
      ],
      quizId: 2,
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      timeLimit: 4,
    });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);

    // Second user deletes the question
    const responseQuestionDelete = requestDeleteQuizQuestion(
      quizId,
      questionId,
      session2
    );
    timeEdited = Math.floor(Date.now() / 1000);
    expect(responseQuestionDelete.body).toStrictEqual({});
    expect(responseQuestionDelete.statusCode).toStrictEqual(ErrorCodes.OK);

    // Verify the question is gone from the second user's quiz view
    responseQuizGet = requestGetQuiz(quizId, session2);
    expect(responseQuizGet.body).toStrictEqual({
      description: 'Description',
      name: 'Name',
      numQuestions: 0,
      questions: [],
      quizId: 2,
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      timeLimit: 0
    });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});
