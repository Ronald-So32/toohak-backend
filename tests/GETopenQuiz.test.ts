import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestQuizExport
} from './testsHelper';

import {
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
let questionId: number;

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
            questionId: questionId,
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

  describe('Testing status code of 401 return values', () => {
    test.each([
      {
        session: session + 'Invalid Session',
        description: 'Invalid session',
      },
      {
        session: '',
        description: 'Empty session',
      }
    ])('$description', ({ session }) => {
      const responseQuizExport = requestQuizExport(quizId, session);
      expect(responseQuizExport.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizExport.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
    });
  });

  describe('Testing status code of 403 return values', () => {
    test('Testing when quiz is does not exist', () => {
      const responseQuizExport = requestQuizExport(quizId + idOffset, session);
      expect(responseQuizExport.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizExport.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });

    test('Testing when quiz is not owned by user', () => {
      session = requestAdminAuthRegister(
        'z7277271@ad.unsw.edu.au',
        'Password1',
        'First',
        'Last'
      ).body.session;

      const responseQuizExport = requestQuizExport(quizId, session);
      expect(responseQuizExport.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizExport.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });
  });
});
