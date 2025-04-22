import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestQuizExport
} from './testsHelper';

import {
  ErrorCodes
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
let questionId: number;
let timeCreated: number;
let timeLastEdited: number;

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
  timeCreated = Math.floor(Date.now() / 1000)
  quizId = responseCreate.body.quizId;
  
  questionId = requestAdminQuizQuestionCreateV2(
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
    ).body.questionId;
  timeLastEdited = Math.floor(Date.now() / 1000)
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
            ],
            thumbnailUrl: 'http://google.com/some/image/path.jpg'
          }
        ],
        timeLimit: 4,
        thumbnailUrl: ''
      }
    });
    expect(responseQuizExport.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});
