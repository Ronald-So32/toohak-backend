import {
  requestClear,
  responseInterface,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminQuizQuestionMove,
  requestAdminQuizQuestionCreate,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
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
let responseQuestion2: responseInterface;
let responseQuestion3: responseInterface;
let session: string;
let quizId: number;
let questionId: number;
let questionId2: number;
let questionId3: number;

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
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'ur mom',
            correct: false
          }
        ]
      }
    }
  );
  questionId = responseQuestion.body.questionId;
  responseQuestion2 = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Yes?',
        timeLimit: 7,
        points: 10,
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
  questionId2 = responseQuestion2.body.questionId;
  responseQuestion3 = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'No?',
        timeLimit: 6,
        points: 7,
        answerOptions: [
          {
            answer: 'True',
            correct: true
          },
          {
            answer: 'False',
            correct: false
          }
        ]
      }
    }
  );
  questionId3 = responseQuestion3.body.questionId;
});

describe('Testing PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      const responseMove = requestAdminQuizQuestionMove(
        quizId, 
        questionId, 
        session, 
        1,
      );
      expect(responseMove.body).toStrictEqual({});
      expect(responseMove.statusCode).toStrictEqual(OK);
    });
  });

  describe('Test error cases', () => {
    
  });
  
  describe('Testing PUT /v1/admin/quiz/{quizid}/question/{questionid}/move works as intended', () => {

  });
});