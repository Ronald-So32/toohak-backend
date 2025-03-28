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
const questionIdOffset = 999;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let responseQuestion: responseInterface;
let responseQuestion2: responseInterface;
let session: string;
let quizId: number;
let questionId: number;
let questionId2: number;

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
            answer: 'False',
            correct: false
          }
        ]
      }
    }
  );
  questionId2 = responseQuestion2.body.questionId;
});
