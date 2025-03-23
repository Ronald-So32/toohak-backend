import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetQuizList,
  requestAdminQuizCreate,
  requestDeleteQuiz,
  requestAdminQuizQuestionCreate,
  requestGetQuiz
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
      question: 'Who is the Monarch of England?',
      timeLimit: 4,
      points: 5,
      answerOptions: [
        {
          answer: 'Prince Charles',
          correct: true
        }
      ]
    }
  );
});

describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    const responseQuizGet = requestGetQuiz(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({
      quizId: quizId,
      name: "Name",
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: "Description",
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: "Who is the Monarch of England?",
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answerId: expect.any(Number),
              answer: "Prince Charles",
              colour: expect.any(String),
              correct: true
            }
          ]
        }
      ],
      timeLimit: 4
    });

    expect(responseQuizGet.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseQuizGet = requestGetQuiz(quizId, session + 'Invalid Session');
      expect(responseQuizGet.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizGet.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when the session is valid but the quizId is not', () => {
      const responseQuizGet = requestGetQuiz(quizId + quizIdOffset, session);
      expect(responseQuizGet.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizGet.statusCode).toStrictEqual(FORBIDDEN);
    });
  });

  test('Testing GET /v1/admin/quiz/{quizid} works as intended', () => {

  });
});
