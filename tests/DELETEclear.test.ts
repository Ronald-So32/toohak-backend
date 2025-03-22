import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestGetQuizList
} from './helper'

import { describe } from 'node:test';

beforeEach(() => {
  requestClear();
});

describe('Testing /v1/clear', () => {
  test('Testing the return value', () => {
    const response = requestClear();
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });
/*
  test('Testing /v1/clear works as intended', () => {
    // Register a user
    const responseRegister = requestAdminAuthRegister('z7277272@ad.unsw.edu.au', 'Password1', 'First', 'Last');
    expect(responseRegister).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(200);

    // Create a quiz
    const responseQuiz = requestAdminQuizCreate(responseRegister.session, 'Name', 'Description');
    expect(responseQuiz).toStrictEqual({ quizId: expect.any(Number) });
    expect(responseQuiz.statusCode).toStrictEqual(200);

    // Check user can login
    const responseLogin = requestAdminAuthLogin('z7277272@ad.unsw.edu.au', 'Password1');
    expect(responseLogin).toStrictEqual({ session: responseRegister.session });
    expect(responseLogin.statusCode).toStrictEqual(200);

    // Check user has correct details
    const responseUserDetails = requestGetUserDetails(responseRegister.session);
    expect(responseUserDetails).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'First Last',
        email: 'z7277272@ad.unsw.edu.au',
        numSuccessfulLogins: 2,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
    expect(responseUserDetails.statusCode).toStrictEqual(200);

    // Check the quiz is listed
    const responseQuizList = requestGetQuizList(responseRegister.session);
    expect(responseQuizList).toStrictEqual({
      quizzes: {
        quizId: responseQuiz.quizId,
        name: 'Name'
      }
    });
    expect(responseQuizList.statusCode).toStrictEqual(200);

    // Clear everything
    const responseClear = requestClear();
    expect(responseClear).toStrictEqual({});
    expect(responseClear.statusCode).toStrictEqual(200);

    // Check user cannot login
    const responseLogin2 = requestAdminAuthLogin('z7277272@ad.unsw.edu.au', 'Password1');
    expect(responseLogin2).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(400);

    // Check user is gone
    const responseUserDetails2 = requestGetUserDetails(responseRegister.session);
    expect(responseUserDetails2).toStrictEqual({ user: {} });
    expect(responseUserDetails2.statusCode).toStrictEqual(200);

    // Check the quiz list is empty
    const responseQuizList2 = requestGetQuizList(responseRegister.session);
    expect(responseQuizList2).toStrictEqual({ quizzes: {} });
    expect(responseQuizList2.statusCode).toStrictEqual(200);

    // Register the same user
    const responseRegister2 = requestAdminAuthRegister('z7277272@ad.unsw.edu.au', 'Password1', 'First', 'Last');
    expect(responseRegister2).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister2.statusCode).toStrictEqual(200);
  });
*/
});
