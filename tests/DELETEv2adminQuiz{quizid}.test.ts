import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetQuizList,
  requestDeleteQuiz,
  requestAdminQuizCreate,
  OK,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset,
  BADREQUEST
} from './testsHelper';

import { describe } from 'node:test';

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let session: string;
let quizId: number;

// Before each test clears the data and registers a user, obtaining it's
// session and creates a quiz for the user, obtaining the quiz id for it
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
});

describe('Testing DELETE /v2/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    const responseDeleteQuiz = requestDeleteQuiz(quizId, session);
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid (401)', () => {
      const responseDeleteQuiz = requestDeleteQuiz(quizId, session + 'Invalid Session');
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when the session is valid but the quizId is not (403)', () => {
      const responseDeleteQuiz = requestDeleteQuiz(quizId + quizIdOffset, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
    });
/*
    test('Testing when the session is valid but the quizId is not (400)', () => {
      // create a game
      const responseDeleteQuiz = requestDeleteQuiz(quizId, session);
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);
    });
*/
  });

  test('Testing DELETE /v2/admin/quiz/{quizid} works as intended', () => {

  });
});
