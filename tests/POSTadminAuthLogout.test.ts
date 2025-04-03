import {
  requestClear,
  responseInterface,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestGetQuiz,
  requestAdminQuizUpdateDescription
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
let session: string;

// Before each test clears the data and then registers an user, obtaining the
// current session
beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
});

describe('Testing POST /v1/admin/auth/logout', () => {
  test('Testing the code 200 return value', () => {
    // Gets the response of when user logs out
    const responseLogout = requestAdminAuthLogout(session);
    // Checks that a valid response returns an empty object and a
    // status code of 200
    expect(responseLogout.body).toStrictEqual({});
    expect(responseLogout.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Invalid session', () => {
      const responseLogout = requestAdminAuthLogout(session + 'Invalid Session');
      // Checks that a unauthorised logout returns an error object and a 
      // status code of 401 
      expect(responseLogout.body).toStrictEqual({ error: expect.any(String) });
      expect(responseLogout.statusCode).toStrictEqual(UNAUTHORISED);

      // Confirm user can log back in
      const responseLogin = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin.statusCode).toStrictEqual(OK);
    });

    test('Logging out after already logging out once', () => {
      const responseLogout = requestAdminAuthLogout(session);
      expect(responseLogout.body).toStrictEqual({});
      expect(responseLogout.statusCode).toStrictEqual(OK);

      const responseLogout2 = requestAdminAuthLogout(session);
      expect(responseLogout2.body).toStrictEqual({ error: expect.any(String) });
      expect(responseLogout2.statusCode).toStrictEqual(UNAUTHORISED);

      // Confirm user can log back in again
      const responseLogin = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin.statusCode).toStrictEqual(OK);
    });

    test('Multiple login sessions', () => {
      // Two other logins (3 in total)
      const responseLogin = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin.statusCode).toStrictEqual(OK);

      const responseLogin2 = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin2.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin2.statusCode).toStrictEqual(OK);

      // Logout all three sessions
      const responseLogout = requestAdminAuthLogout(responseLogin.body.session);
      expect(responseLogout.body).toStrictEqual({});
      expect(responseLogout.statusCode).toStrictEqual(OK);

      const responseLogout2 = requestAdminAuthLogout(responseLogin2.body.session);
      expect(responseLogout2.body).toStrictEqual({});
      expect(responseLogout2.statusCode).toStrictEqual(OK);

      const responseLogout3 = requestAdminAuthLogout(session);
      expect(responseLogout3.body).toStrictEqual({});
      expect(responseLogout3.statusCode).toStrictEqual(OK);

      // Confirm user can log back in again
      const responseLogin3 = requestAdminAuthLogin(
        'z7277272@ad.unsw.edu.au',
        'Password1'
      );
      expect(responseLogin3.body).toStrictEqual({ session: expect.any(String) });
      expect(responseLogin3.statusCode).toStrictEqual(OK);

      // Should only logout once more
      const responseLogout4 = requestAdminAuthLogout(responseLogin3.body.session);
      expect(responseLogout4.body).toStrictEqual({});
      expect(responseLogout4.statusCode).toStrictEqual(OK);

      const responseLogout5 = requestAdminAuthLogout(session);
      expect(responseLogout5.body).toStrictEqual({ error: expect.any(String) });
      expect(responseLogout5.statusCode).toStrictEqual(UNAUTHORISED);
    });
  });

  test('Testing POST /v1/admin/auth/logout works as intended', () => {
    // Create a quiz using original session
    const responseCreate = requestAdminQuizCreate(
      session,
      'Quiz Name',
      'Quiz Description'
    );
    const quizId = responseCreate.body.quizId;
    expect(responseCreate.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(responseCreate.statusCode).toStrictEqual(OK);

    const responseLogout = requestAdminAuthLogout(responseLogin.body.session);
    expect(responseLogout.body).toStrictEqual({});
    expect(responseLogout.statusCode).toStrictEqual(OK);

    // Check quiz
    const responseQuizGet = requestGetQuiz(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Quiz Description',
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(responseQuizGet.statusCode).toStrictEqual(OK);

    // Edit quiz description (In the other device)
    const responseUpdateDescription = requestAdminQuizUpdateDescription(
      quizId,
      session,
      'New Description'
    );
    expect(responseUpdateDescription.body).toStrictEqual({});
    expect(responseUpdateDescription.statusCode).toStrictEqual(OK);

    const responseQuizGet2 = requestGetQuiz(quizId, session);
    expect(responseQuizGet2.body).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'New Description',
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(responseQuizGet2.statusCode).toStrictEqual(OK);

    const responseLogout2 = requestAdminAuthLogout(session);
    expect(responseLogout2.body).toStrictEqual({});
    expect(responseLogout2.statusCode).toStrictEqual(OK);

    // Try to edit the quiz description
    const responseUpdateDescription2 = requestAdminQuizUpdateDescription(
      quizId,
      session,
      'New New Description'
    );
    expect(responseUpdateDescription2.body).toStrictEqual({ error: expect.any(String) });
    expect(responseUpdateDescription2.statusCode).toStrictEqual(UNAUTHORISED);

    // Confirm user can log back in again
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin2.body).toStrictEqual({ session: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(OK);

    // Quiz description shouldn't change
    const responseQuizGet3 = requestGetQuiz(quizId, responseLogin2.body.session);
    expect(responseQuizGet3.body).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'New Description',
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(responseQuizGet3.statusCode).toStrictEqual(OK);

    // Edit quiz description
    const responseUpdateDescription3 = requestAdminQuizUpdateDescription(
      quizId,
      responseLogin2.body.session,
      'New Description 2'
    );
    expect(responseUpdateDescription3.body).toStrictEqual({});
    expect(responseUpdateDescription3.statusCode).toStrictEqual(OK);

    // Check quiz again to see the changes
    const responseQuizGet4 = requestGetQuiz(quizId, responseLogin2.body.session);
    expect(responseQuizGet4.body).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'New Description 2',
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(responseQuizGet4.statusCode).toStrictEqual(OK);

    const responseLogout3 = requestAdminAuthLogout(responseLogin2.body.session);
    expect(responseLogout3.body).toStrictEqual({});
    expect(responseLogout3.statusCode).toStrictEqual(OK);
  });
});
