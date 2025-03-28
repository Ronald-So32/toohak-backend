import {
  requestClear,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestAdminQuizQuestionCreate,
  requestDeleteQuizQuestion,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;
const questionIdOffset = 727;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let responseQuestion: responseInterface;
let responseQuizGet: responseInterface;
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
  responseQuestion = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: "Who is the Monarch of England?",
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: "Prince Charles",
            correct: true
          },
          {
            answer: "ur mom",
            correct: false
          }
        ]
      }
    }
  );
  questionId = responseQuestion.body.questionId;
  responseQuizGet = requestGetQuiz(quizId, session);
});

describe('Testing PUT v1/admin/quiz/{quizid}/description', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      const responseQuestionDelete = requestDeleteQuizQuestion(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({});
      expect(responseQuestionDelete.statusCode).toStrictEqual(OK);
    });
  });

  describe('Test error cases', () => {
    
  });

  test('Testing PUT v1/admin/quiz/{quizid}/description works as intended', () => {

  });
});
