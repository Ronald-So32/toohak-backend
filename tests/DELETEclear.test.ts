import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestGetQuizList
} from './helper.test'

import request from 'sync-request-curl';
import config from '../src/config.json';
import { describe } from 'node:test';

beforeEach(() => {
  requestClear();
});

describe('Testing /v1/clear', () => {
  test('Testing the return value', () => {
    const response = requestClear();
    expect(response).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(200);
  });

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
  });
});