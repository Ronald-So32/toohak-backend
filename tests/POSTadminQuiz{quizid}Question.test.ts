import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate
  // requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
const quizIdOffset = 727;
const questionIdOffset = 999;

let responseRegister: responseInterface;
let session: string;
let responseQuizCreate: responseInterface;

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  
  requestAdminAuthLogin('z7277272@ad.unsw.edu.au','Password1');

  const responseQuizCreate = requestAdminQuizQuestionCreate(
    session,
    'Quiz Name',
    'Description'
  );
  quizId = responseQuizCreate.body.quizId;

});

describe('Testing POST /v1/admin/quiz', () => {
  test('Testing the return value', () => {
    const responseQuestionCreate = requestAdminQuizQuestionCreate(
      quizId,
      session,
      {
        "questionBody": {
          "question": "Question",
          "timeLimit": 4,
          "points": 5,
          "answerOptions": [
            {
              "answer": "Right",
              "correct": true
            }
          ]
        }
      }
    );
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing the question string', () => {
      
    });

    describe('Testing the answers', () => {
    
    });

    describe('Testing the timelimit', () => {
    
    });

    describe('Testing the points awarded', () => {
    
    });

  })

});
