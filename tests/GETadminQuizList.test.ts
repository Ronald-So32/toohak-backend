import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetQuizList,
  requestAdminQuizCreate,
  requestDeleteQuiz
 } from './testsHelper';
 import {
  ErrorCodes
 } from '../src/functionsHelper';
 import { describe } from 'node:test';
 
 /**
 * Variable to store the registration response.
 * @type {responseInterface}
 */
 let responseRegister: responseInterface;
 
 /**
 * Variable to store the session token.
 * @type {string}
 */
 let session: string;
 
 /**
 * Before each test, clear the data store, register a user, and obtain the current session.
 * This ensures each test starts with a clean environment.
 */
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
 
 /**
 * Test suite for the GET /v1/admin/quiz/list endpoint.
 * This endpoint retrieves all quizzes owned by the currently logged in user.
 */
 describe('Testing GET /v1/admin/quiz/list', () => {
  /**
   * Test case to verify a successful response with status code 200.
   * When a user with no quizzes requests their quiz list, they should receive an empty array.
   */
  test('Testing the code 200 return value', () => {
    // Gets the quiz list of the current user
    const responseList = requestGetQuizList(session);
    // Checks that it returns a quizzes object with an empty array
    // and a status code of 200
    expect(responseList.body).toStrictEqual({ quizzes: [] });
    expect(responseList.statusCode).toStrictEqual(ErrorCodes.OK);
  });
 
  /**
   * Test suite for error responses from the GET /v1/admin/quiz/list endpoint.
   */
  describe('Testing for error responses', () => {
    /**
     * Test suite for 401 Unauthorized responses.
     * These occur when the session token is invalid or missing.
     */
    describe('Testing status code of 401 return values', () => {
      /**
       * Parameterized test cases for different unauthorized scenarios.
       * Each test provides a different invalid session value and a description.
       */
      test.each([
        {
          session: session + 'Invalid Session',
          description: 'Invalid session',
        },
        {
          session: '',
          description: 'Empty session',
        }
      ])('$description', ({ session }) => {
        const responseList = requestGetQuizList(session + 'Invalid Session');
        // Checks that the response when fetching for quiz list of invalid session
        // returns an error object and a status code of 401
        expect(responseList.body).toStrictEqual({ error: expect.any(String) });
        expect(responseList.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });
  });
 
  /**
   * Comprehensive test case that verifies the endpoint works as intended through
   * multiple operations (creating and deleting quizzes).
   */
  test('Testing GET /v1/admin/quiz/list works as intended', () => {
    // First, verify the user has no quizzes
    const responseList = requestGetQuizList(session);
    expect(responseList.body).toStrictEqual({ quizzes: [] });
    expect(responseList.statusCode).toStrictEqual(ErrorCodes.OK);
    
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
    expect(responseList2.statusCode).toStrictEqual(ErrorCodes.OK);
    
    // Add another quiz
    requestAdminQuizCreate(
      session,
      'Name2',
      'Description2'
    );
    
    // Verify both quizzes are now in the list
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
    expect(responseList3.statusCode).toStrictEqual(ErrorCodes.OK);
    
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
    expect(responseList4.statusCode).toStrictEqual(ErrorCodes.OK);
  });
 });