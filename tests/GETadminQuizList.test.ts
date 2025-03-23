import exp from 'constants';
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

let responseRegister: responseInterface;
let session: string;

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

describe('Testing GET /v1/admin/quiz/list', () => {
  test('Testing the code 200 return value', () => {
    const responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({ quizzes: [] });
    expect(responseList.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseList = requestGetQuizList(session + "Invalid Session");
      expect(responseList.body).toStrictEqual({ error: expect.any(String) });
      expect(responseList.statusCode).toStrictEqual(UNAUTHORISED);
    });
  });
/*
  test('Testing GET /v1/admin/quiz/list works as intended', () => {
    const responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({ quizzes: [] });
    expect(responseList.statusCode).toStrictEqual(OK);

    requestAdminQuizCreate(
      session,
      'Name',
      'Description'
    );
    
    const responseList2 = requestGetQuizList(session);
    expect(responseList2.body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Name'
        },
      ]
    });
    expect(responseList2.statusCode).toStrictEqual(OK);

    // Add another quiz
    requestAdminQuizCreate(
      session,
      'Name2',
      'Description2'
    );
    
    const responseList3 = requestGetQuizList(session);
    expect(responseList3.body).toStrictEqual({
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
    expect(responseList3.statusCode).toStrictEqual(OK);

    requestDeleteQuiz(
      responseList3.body.quizzes[0].quizId,
      session
    );

    const responseList4 = requestGetQuizList(session);
    expect(responseList4.body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Name2'
        }
      ]
    });
    expect(responseList4.statusCode).toStrictEqual(OK);
  });
*/
});
