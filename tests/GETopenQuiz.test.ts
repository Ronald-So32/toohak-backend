import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestQuizExport,
  OK
} from './testsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
// let questionId: number;
// let gameId: number;
// let playerId: number;
// let timeCreated: number;
// let timeLastEdited: number;

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
  // timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;

  /* const responseQuestionCreate = */requestAdminQuizQuestionCreate(
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
  // questionId = responseQuestionCreate.body.questionId;
});

describe('Testing GET /v1/open/CSV', () => {
  test('Testing the code 200 return value', () => {
    const responseQuizExport = requestQuizExport(quizId, session);
    expect(responseQuizExport.body).toStrictEqual({
      file: responseQuizExport.body.file,
      newJSON: {
        name: 'Name',
        description: 'Description',
        numQuestions: 1,
        questions: [
          {
            questionId: expect.any(Number),
            question: 'Who is the Monarch of England?',
            timeLimit: 4,
            points: 5,
            answerOptions: [
              {
                answer: 'Prince Charles',
                correct: true,
                answerId: expect.any(Number),
                colour: expect.any(String)
              },
              {
                answer: 'Queen Elizibeth',
                correct: false,
                answerId: expect.any(Number),
                colour: expect.any(String)
              }
            ]
          }
        ],
        timeLimit: 4,
        thumbnailUrl: ''
      }
    });
    expect(responseQuizExport.statusCode).toStrictEqual(OK);
  });
});
