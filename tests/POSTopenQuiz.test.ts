import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestQuizExport,
  requestQuizImport,
  requestGetQuizList,
  requestAdminQuizThumbnailUpdate
} from './testsHelper';

import {
  ErrorCodes
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let session2: string;
let quizId: number;
let fileName: string;

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

  requestAdminQuizQuestionCreateV2(
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
  );
  requestAdminQuizThumbnailUpdate(quizId, session, 'http://google.com/some/image/path.jpg');
  fileName = requestQuizExport(quizId, session).body.file;
  const responseRegister2 = requestAdminAuthRegister(
    'z727f7272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session2 = responseRegister2.body.session;
});

describe('Testing GET /v1/open/CSV', () => {
  test('Testing the code 200 return value', () => {
    const responseQuizExport = requestQuizImport(fileName, session2);
    expect(responseQuizExport.body).toStrictEqual({ quizId: responseQuizExport.body.quizId });
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
      const responseQuizExport = requestQuizImport(fileName, session);
      expect(responseQuizExport.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizExport.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
    });
  });

  test('Testing the code 400 return value', () => {
    const responseQuizExport = requestQuizImport('Invalid File', session2);
    expect(responseQuizExport.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizExport.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
  });

  test('Intended', () => {
    const responseQuizExport = requestQuizImport(fileName, session2);
    expect(responseQuizExport.body).toStrictEqual({ quizId: responseQuizExport.body.quizId });
    expect(responseQuizExport.statusCode).toStrictEqual(ErrorCodes.OK);

    // See that they both have it

    const responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({
      quizzes: [
        {
          name: 'Name',
          quizId,
        },
      ],
    });
    expect(responseList.statusCode).toStrictEqual(ErrorCodes.OK);

    const responseList2 = requestGetQuizList(session2);
    expect(responseList2.body).toStrictEqual({
      quizzes: [
        {
          name: 'Name',
          quizId: responseQuizExport.body.quizId,
        },
      ],
    });
    expect(responseList2.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});
