import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetQuizList,
  requestAdminQuizCreate,
  requestDeleteQuiz,
  requestAdminQuizQuestionCreate,
  requestGetQuiz,
  requestAdminQuizUpdateName,
  requestAdminQuizUpdateDescription,
  requestAdminQuizQuestionUpdate,
  requestDeleteQuizQuestion
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let responseQuestionCreate: responseInterface;
let session: string;
let quizId: number;
let questionId: number;

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseCreate.body.quizId;
  responseQuestionCreate = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Question',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Right',
            correct: true
          },
          {
            answer: 'Wrong',
            correct: false
          }
        ]
      }
    }
  );
  questionId = responseQuestionCreate.body.questionId
});

describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    const responseQuizDetails = requestGetQuiz(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 1,
      questions: [
        {
          question: 'Question',
          questionId: questionId,
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Right',
              colour: expect.any(String),
              correct: true,
              id: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseQuizDetails = requestGetQuiz(quizId, session + 'Invalid Session');
      expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizDetails.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when the session is valid but the quizId is not', () => {
      const responseQuizDetails = requestGetQuiz(quizId + quizIdOffset, session);
      expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizDetails.statusCode).toStrictEqual(FORBIDDEN);
    });
  });

  test('Testing GET /v1/admin/quiz/{quizid} works as intended', () => {
    let responseQuizDetails = requestGetQuiz(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 1,
      questions: [
        {
          question: 'Question',
          questionId: questionId,
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Right',
              colour: expect.any(String),
              correct: true,
              id: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
    responseQuestionCreate = requestAdminQuizQuestionCreate(
      quizId,
      session,
      {
        questionBody: {
          question: 'Question2',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Right',
              correct: true
            },
            {
              answer: 'Wrong',
              correct: false
            }
          ]
        }
      }
    );
    const questionId2 = responseQuestionCreate.body.questionId;

    requestAdminQuizUpdateName(
      quizId,
      session,
      'New Name'
    );
    requestAdminQuizUpdateDescription(
      quizId,
      session,
      'New Description'
    );

    requestAdminQuizQuestionUpdate(
      quizId,
      questionId,
      session,
      {
        questionBody: {
          question: 'Question1',
          timeLimit: 45,
          points: 6,
          answerOptions: [
            {
              answer: 'Changed Right',
              correct: true
            },
            {
              answer: 'Wrong',
              correct: false
            },
            {
              answer: 'Extra',
              correct: false
            }
          ]
        }
      }
    );
    responseQuizDetails = requestGetQuiz(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'New Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'New Description',
      numQuestions: 2,
      questions: [
        {
          question: 'Question1',
          questionId: questionId,
          timeLimit: 45,
          points: 6,
          answerOptions: [
            {
              answer: 'Changed Right',
              colour: expect.any(String),
              correct: true,
              id: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            },
            {
              answer: 'Extra',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            },
          ]
        },
        {
          question: 'Question2',
          questionId: questionId2,
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Right',
              colour: expect.any(String),
              correct: true,
              id: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
    
    requestDeleteQuizQuestion(quizId, questionId, session);
    requestDeleteQuizQuestion(quizId, questionId2, session);

    responseQuizDetails = requestGetQuiz(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'New Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'New Description',
      numQuestions: 0,
      questions: [],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
    
    requestDeleteQuiz(quizId, session);

    responseQuizDetails = requestGetQuiz(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizDetails.statusCode).toStrictEqual(FORBIDDEN);
  });
});
