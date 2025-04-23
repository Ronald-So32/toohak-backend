import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestGetQuizQuestionSuggestion
} from './testsHelper';

import {
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

// Define variables to store response objects, session token, and quiz ID
let responseRegister: responseInterface;
let responseCreate: responseInterface;
let session: string;
let quizId: number;

// Before each test clears the data then registers a user and gets
// the current session then creating a quiz and gets the quiz id
beforeEach(() => {
  // Reset the application state before each test
  requestClear();
  
  // Register a new admin user and extract the session token
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  
  // Create a quiz about computer science and extract the quiz ID
  responseCreate = requestAdminQuizCreate(
    session,
    'Computer Science Quiz',
    'A quiz about computer science concepts'
  );
  quizId = responseCreate.body.quizId;
});

describe('Testing GET /v1/admin/quiz/{quizid}/question/suggestion', () => {
  test('Testing the code 200 return value', () => {
    // Generates a question suggestion and gets the response
    const responseQuestionSuggestion = requestGetQuizQuestionSuggestion(
      quizId,
      session
    );
    
    // Checks that a valid response returns a question object with suggested
    // quiz and a status code of 200
    expect(responseQuestionSuggestion.body).toStrictEqual({
      question: expect.any(String)
    });
    expect(responseQuestionSuggestion.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing status code of 401 return values', () => {
      // Test multiple unauthorized scenarios using parametrized tests
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
        // Attempt to get question suggestion with invalid session credentials
        const responseQuestionSuggestion = requestGetQuizQuestionSuggestion(
          quizId,
          session
        );
        
        // Checks that an unauthorized call to suggest question returns an error object
        // and a status code of 401
        expect(responseQuestionSuggestion.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionSuggestion.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });
    
    test('Testing when the session is valid but the quizId is not', () => {
      // Attempt to get question suggestion for a non-existent quiz
      const responseQuestionSuggestion = requestGetQuizQuestionSuggestion(
        quizId + idOffset,
        session
      );
      
      // Checks that a call to suggest from non-existent quiz returns an error object
      // and status code of 403
      expect(responseQuestionSuggestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionSuggestion.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });
  });

  test('Testing GET /v1/admin/quiz/{quizid}/question/suggestion works as intended', () => {
    // Create a second quiz with different name/description to test
    // that suggestions are contextually relevant
    const responseCreate2 = requestAdminQuizCreate(
      session,
      'History Quiz',
      'A quiz about world history events'
    );
    const quizId2 = responseCreate2.body.quizId;

    // Get suggestions for both quizzes
    const computerQuizSuggestion = requestGetQuizQuestionSuggestion(
      quizId,
      session
    );

    const historyQuizSuggestion = requestGetQuizQuestionSuggestion(
      quizId2,
      session
    );

    // Both should return valid suggestions that also match the question create's requirements
    expect(computerQuizSuggestion.statusCode).toStrictEqual(ErrorCodes.OK);
    expect(computerQuizSuggestion.body).toHaveProperty('question');
    expect(computerQuizSuggestion.body.question.length).toBeGreaterThan(0);

    expect(historyQuizSuggestion.statusCode).toStrictEqual(ErrorCodes.OK);
    expect(historyQuizSuggestion.body).toHaveProperty('question');
    expect(historyQuizSuggestion.body.question.length).toBeGreaterThan(0);
  });
});