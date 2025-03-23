import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizUpdateName,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
const quizIdOffset = 727;

let responseRegister: responseInterface;
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
  const responseCreate = requestAdminQuizCreate(
    session,
    'Quiz Name',
    'Quiz Description'
  );
  quizId = responseCreate.body.quizId;
});

describe('Testing PUT /v1/admin/quiz/{quizid}/name', () => {
  test('Testing the code 200 return value', () => {
    const responseUpdate = requestAdminQuizUpdateName(
      quizId,
      session,
      'New Quiz Name'
    );
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseUpdate = requestAdminQuizUpdateName(
        quizId,
        session + 'Invalid Session',
        'New Quiz Name'
      );
      expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdate.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when the quizId is invalid', () => {
      const responseUpdate = requestAdminQuizUpdateName(
        quizId + quizIdOffset,
        session,
        'New Quiz Name'
      );
      expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdate.statusCode).toStrictEqual(FORBIDDEN);
    });
  });
});