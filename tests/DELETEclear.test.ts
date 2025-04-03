import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminQuizCreate,
  requestGetQuizList
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;

// Before each test clears the data
beforeEach(() => {
  requestClear();
});

describe('Testing DELETE /v1/clear', () => {
  test('Testing the code 200 return value', () => {
    const response = requestClear();
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(OK);
  });

  test('Testing DELETE /v1/clear works as intended', () => {
    // Register a user
    const responseRegister = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(OK);

    const session = responseRegister.body.session;
    // Create a quiz
    const responseQuiz = requestAdminQuizCreate(
      session,
      'Name',
      'Description'
    );
    expect(responseQuiz.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(responseQuiz.statusCode).toStrictEqual(OK);
    const quizId = responseQuiz.body.quizId;

    // Check user has correct details
    const responseUserDetails = requestGetUserDetails(session);
    expect(responseUserDetails.body).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails.statusCode).toStrictEqual(OK);

    // Check the quiz is listed
    const responseQuizList = requestGetQuizList(session);
    expect(responseQuizList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Name'
        }
      ]
    });
    expect(responseQuizList.statusCode).toStrictEqual(OK);

    // Clear everything
    const responseClear = requestClear();
    expect(responseClear.body).toStrictEqual({});
    expect(responseClear.statusCode).toStrictEqual(OK);

    // Check user cannot login
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin2.body).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(BADREQUEST);

    // Check user is gone
    const responseUserDetails2 = requestGetUserDetails(session);
    expect(responseUserDetails2.body).toStrictEqual({ error: expect.any(String) });
    expect(responseUserDetails2.statusCode).toStrictEqual(UNAUTHORISED);

    // Check that quiz list of deleted user can't be obtained
    const responseQuizList2 = requestGetQuizList(session);
    expect(responseQuizList2.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizList2.statusCode).toStrictEqual(UNAUTHORISED);

    // Register the same user
    const responseRegister2 = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    expect(responseRegister2.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister2.statusCode).toStrictEqual(OK);
  });
});
