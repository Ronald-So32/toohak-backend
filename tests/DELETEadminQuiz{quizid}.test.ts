import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetQuizList,
  requestDeleteQuiz,
  requestAdminQuizCreate
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

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    // Deletes the quiz created by the current user and gets it's response
    const responseDeleteQuiz = requestDeleteQuiz(quizId, session);
    // Checks that the response of the quiz deletion returns an empty object
    // and a status code of 200
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseDeleteQuiz = requestDeleteQuiz(quizId, session + 'Invalid Session');
      // Checks that the response of an unauthorised quiz deletion returns an error object
      // and a status code of 401
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when the session is valid but the quizId is not', () => {
      const responseDeleteQuiz = requestDeleteQuiz(quizId + quizIdOffset, session);
      // Checks that the deletion of a non-existent quiz returns and error object and
      // a status code of 403
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
    });
  });

  test('Testing DELETE /v1/admin/quiz/{quizid} works as intended', () => {
    // Get the quiz list of the current user to check that there is a quiz
    const responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Name'
        },
      ]
    });
    expect(responseList.statusCode).toStrictEqual(OK);

    // Add another quiz
    requestAdminQuizCreate(
      session,
      'Name2',
      'Description2'
    );

    const responseList2 = requestGetQuizList(session);
    expect(responseList2.body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Name'
        },
        {
          quizId: expect.any(Number),
          name: 'Name2'
        },
      ]
    });
    expect(responseList2.statusCode).toStrictEqual(OK);
    // Deletes a quiz using the list of quiz obtained
    const responseDeleteQuiz = requestDeleteQuiz(
      responseList2.body.quizzes[0].quizId,
      session
    );
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);

    const responseList3 = requestGetQuizList(session);
    expect(responseList3.body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Name2'
        }
      ]
    });
    expect(responseList3.statusCode).toStrictEqual(OK);
  });
});
