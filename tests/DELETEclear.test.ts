import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestGetUserDetails,
  requestAdminQuizCreate,
  requestGetQuizList
} from './testsHelper';
import {
  ErrorCodes
} from '../src/functionsHelper';
import { describe } from 'node:test';

// Before each test clears the data
beforeEach(() => {
  // Reset the application state before each test
  requestClear();
});

describe('Testing DELETE /v1/clear', () => {
  test('Testing the code 200 return value', () => {
    // Check that the clear route returns an empty object with status 200
    const response = requestClear();
    expect(response.body).toStrictEqual({});
    expect(response.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  test('Testing DELETE /v1/clear works as intended', () => {
    // Register a user and store the session token
    const responseRegister = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    expect(responseRegister.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister.statusCode).toStrictEqual(ErrorCodes.OK);
    const session = responseRegister.body.session;

    // Create a quiz for the registered user and store the quiz ID
    const responseQuiz = requestAdminQuizCreate(
      session,
      'Name',
      'Description'
    );
    expect(responseQuiz.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(responseQuiz.statusCode).toStrictEqual(ErrorCodes.OK);
    const quizId = responseQuiz.body.quizId;

    // Verify the user details are correct
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
    expect(responseUserDetails.statusCode).toStrictEqual(ErrorCodes.OK);

    // Verify the created quiz appears in the user's quiz list
    const responseQuizList = requestGetQuizList(session);
    expect(responseQuizList.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Name'
        }
      ]
    });
    expect(responseQuizList.statusCode).toStrictEqual(ErrorCodes.OK);

    // Clear the application state
    const responseClear = requestClear();
    expect(responseClear.body).toStrictEqual({});
    expect(responseClear.statusCode).toStrictEqual(ErrorCodes.OK);

    // Verify the user can no longer login after clearing the data
    const responseLogin2 = requestAdminAuthLogin(
      'z7277272@ad.unsw.edu.au',
      'Password1'
    );
    expect(responseLogin2.body).toStrictEqual({ error: expect.any(String) });
    expect(responseLogin2.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

    // Verify the user details can no longer be accessed with the old session
    const responseUserDetails2 = requestGetUserDetails(session);
    expect(responseUserDetails2.body).toStrictEqual({ error: expect.any(String) });
    expect(responseUserDetails2.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);

    // Verify the quiz list can no longer be accessed with the old session
    const responseQuizList2 = requestGetQuizList(session);
    expect(responseQuizList2.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizList2.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);

    // Verify that the same user can be registered again after clearing
    const responseRegister2 = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    expect(responseRegister2.body).toStrictEqual({ session: expect.any(String) });
    expect(responseRegister2.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});
