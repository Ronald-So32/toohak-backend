import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetQuizList,
  requestDeleteQuiz,
  requestAdminQuizCreate,
  // requestAdminQuizCreate
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
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
  )
  quizId = responseCreate.body.quizId;
});

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    const responseDeleteQuiz = requestDeleteQuiz(quizId, session);
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseList = requestGetQuizList(session + 'Invalid Session');
      expect(responseList.body).toStrictEqual({ error: expect.any(String) });
      expect(responseList.statusCode).toStrictEqual(UNAUTHORISED);
    });
  });

  test('Testing DELETE /v1/admin/quiz/{quizid} works as intended', () => {

  });
});
