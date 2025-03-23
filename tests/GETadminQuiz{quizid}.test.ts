import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetQuizList,
  requestAdminQuizCreate,
  requestDeleteQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;

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

describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    const responseQuizList = requestGetQuizList(session);
    expect(responseQuizList.body).toStrictEqual({});
    expect(responseQuizList.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseQuizList = requestGetQuizList(session + 'Invalid Session');
      expect(responseQuizList.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizList.statusCode).toStrictEqual(UNAUTHORISED);
    });
    
    test('Testing when the session is valid but the quizId is not', () => {
      const responseQuizList = requestDeleteQuiz(quizId + quizIdOffset, session);
      expect(responseQuizList.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizList.statusCode).toStrictEqual(FORBIDDEN);
    });
  });

  test('Testing GET /v1/admin/quiz/{quizid} works as intended', () => {

  });
});
