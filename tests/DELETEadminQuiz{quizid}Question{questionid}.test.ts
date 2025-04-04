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

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;
const questionIdOffset = 727;

let responseQuizGet: responseInterface;
let session: string;
let quizId: number;
let questionId: number;

// Before each test clears the data then registers a user, gets the
// current session then creates a quiz and gets the quiz and question id
// with the quiz details
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
  questionId = responseQuestion.body.questionId;
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
      // Checks that a valid deltion returns an empty object and a
      // status code of 200
      expect(responseQuestionDelete.body).toStrictEqual({});
      expect(responseQuestionDelete.statusCode).toStrictEqual(OK);
    });
  });

  describe('Test error cases', () => {
    test('Session is invalid', () => {
      const responseQuestionDelete = requestDeleteQuizQuestion(
        quizId,
        questionId,
        session + 'Invalid Session'
      );
      // Checks that a unauthorised deletion returns an error object and a
      // status code of 401
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(UNAUTHORISED);

      // Check quiz has not been deleted
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(OK);
    });

    test('Quiz id is invalid', () => {
      const responseQuestionDelete = requestDeleteQuizQuestion(
        quizId + quizIdOffset,
        questionId,
        session
      );
      // Checks that a foribidden deletion returns an error object and a
      // status code of 403
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(FORBIDDEN);

      // Check quiz has not been deleted
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(OK);
    });

    test('Question id is invalid', () => {
      const responseQuestionDelete = requestDeleteQuizQuestion(
        quizId,
        questionId + questionIdOffset,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(BADREQUEST);

      // Check quiz has not been deleted
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(OK);
    });
  });

  test('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid} works as intended', () => {
    // Registers a second user and gets it's session
    const responseRegister2 = requestAdminAuthRegister(
      'z6969@ad.unsw.edu.au',
      'Password2',
      'Firstt',
      'Lastt'
    );
    const session2 = responseRegister2.body.session;

    // Transfer ownership to user 2
    const responseTransfer = requestAdminQuizTransfer(
      quizId,
      session,
      'z6969@ad.unsw.edu.au'
    );
    expect(responseTransfer.body).toStrictEqual({});
    expect(responseTransfer.statusCode).toStrictEqual(OK);

    // Fail because its no longer user 1's quiz
    responseQuizGet = requestGetQuiz(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizGet.statusCode).toStrictEqual(FORBIDDEN);

    // Check it is user 2's quiz
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
              id: 1,
            },
            {
              answer: 'Queen Elizibeth',
              colour: expect.any(String),
              correct: false,
              id: 2,
            },
          ],
          points: 5,
          question: 'Who is the Monarch of England?',
          questionId: 3,
          timeLimit: 4,
        },
      ],
      quizId: 2,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      timeLimit: 4,
    });
    expect(responseQuizGet.statusCode).toStrictEqual(OK);

    // Delete from user 2
    const responseQuestionDelete = requestDeleteQuizQuestion(
      quizId,
      questionId,
      session2
    );
    expect(responseQuestionDelete.body).toStrictEqual({});
    expect(responseQuestionDelete.statusCode).toStrictEqual(OK);

    // Check its gone in user 2
    responseQuizGet = requestGetQuiz(quizId, session2);
    expect(responseQuizGet.body).toStrictEqual({
      description: 'Description',
      name: 'Name',
      numQuestions: 0,
      questions: [],
      quizId: 2,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      timeLimit: 0
    });
    expect(responseQuizGet.statusCode).toStrictEqual(OK);
  });
});
