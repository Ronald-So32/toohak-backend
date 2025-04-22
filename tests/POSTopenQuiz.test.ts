import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestQuizExport,
  requestQuizImport,
  OK,
  BADREQUEST,
  FORBIDDEN,
  UNAUTHORISED,
  requestGetQuizList
} from './testsHelper';

import { describe } from 'node:test';

let session: string;
let session2: string;
let quizId: number;
// let questionId: number;
let gameId: number;
let playerId: number;
// let timeCreated: number;
// let timeLastEdited: number;
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
    expect(responseQuizExport.statusCode).toStrictEqual(OK);
  });

  test('Intended', () => {
    const responseQuizExport = requestQuizImport(fileName, session2);
    expect(responseQuizExport.body).toStrictEqual({ quizId: responseQuizExport.body.quizId });
    expect(responseQuizExport.statusCode).toStrictEqual(OK);

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
    expect(responseList.statusCode).toStrictEqual(OK);

    const responseList2 = requestGetQuizList(session2);
    expect(responseList2.body).toStrictEqual({
      quizzes: [
        {
          name: 'Name',
          quizId: responseQuizExport.body.quizId,
        },
      ],
    });
    expect(responseList2.statusCode).toStrictEqual(OK);
  });
});
