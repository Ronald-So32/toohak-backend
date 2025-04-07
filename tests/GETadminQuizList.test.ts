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

// Before each test clears the data and registers a user and obtains the current session
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
    // Gets the quiz list of the current user
    const responseList = requestGetQuizList(session);
    // Checks that it returns a quizzes object with an empty array
    // and a status code of 200
    expect(responseList.body).toStrictEqual({ quizzes: [] });
    expect(responseList.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseList = requestGetQuizList(session + 'Invalid Session');
      // Checks that the response when fetching for quiz list of invalid session
      // returns an error object and a status code of 401
      expect(responseList.body).toStrictEqual({ error: expect.any(String) });
      expect(responseList.statusCode).toStrictEqual(UNAUTHORISED);
    });
  });

  test('Testing GET /v1/admin/quiz/list works as intended', () => {
    const responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({ quizzes: [] });
    expect(responseList.statusCode).toStrictEqual(OK);
    // Creates a quiz
    requestAdminQuizCreate(
      session,
      'Name',
      'Description'
    );
    // Checks that the quiz created is in the quiz list of the user
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
    // Deletes a quiz using the quiz list
    requestDeleteQuiz(
      responseList3.body.quizzes[0].quizId,
      session
    );

    // Checks that the quiz is actually deleted
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
});
