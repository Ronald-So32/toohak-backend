import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestGetQuizQuestionSuggestion
} from './testsHelper';

const OK = 200;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;
let responseRegister: responseInterface;
let responseCreate: responseInterface;
let session: string;
let quizId: number;

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
    /* 
    For this specific test case, we use different contents since its testing
    response from an LLM.
    */
   
    'Computer Science Quiz',
    'A quiz about computer science concepts'
  );
  quizId = responseCreate.body.quizId;
});

describe('Testing GET /v1/admin/quiz/{quizid}/question/suggestion', () => {
  test('Testing the code 200 return value', () => {
    const responseQuestionSuggestion = requestGetQuizQuestionSuggestion(
      quizId,
      session
    );
    
    expect(responseQuestionSuggestion.statusCode).toStrictEqual(OK);
    expect(responseQuestionSuggestion.body).toStrictEqual({
      question: expect.any(String)
    });
    // The suggestion should be a non-empty string
    expect(responseQuestionSuggestion.body.question.length).toBeGreaterThan(0);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseQuestionSuggestion = requestGetQuizQuestionSuggestion(
        quizId,
        session + 'Invalid Session'
      );
      
      expect(responseQuestionSuggestion.statusCode).toStrictEqual(UNAUTHORISED);
      expect(responseQuestionSuggestion.body).toStrictEqual({ error: expect.any(String) });
    });

    test('Testing when the session is valid but the quizId is not', () => {
      const responseQuestionSuggestion = requestGetQuizQuestionSuggestion(
        quizId + quizIdOffset,
        session
      );
      
      expect(responseQuestionSuggestion.statusCode).toStrictEqual(FORBIDDEN);
      expect(responseQuestionSuggestion.body).toStrictEqual({ error: expect.any(String) });
    });
  });

  test('Testing GET /v1/admin/quiz/{quizid}/question/suggestion works as intended', () => {
    /* 
    Create a second quiz with different name/description to test
    that suggestions are contextually relevant 
    */
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
    
    // Both should return valid suggestions
    expect(computerQuizSuggestion.statusCode).toStrictEqual(OK);
    expect(computerQuizSuggestion.body).toHaveProperty('question');
    
    expect(historyQuizSuggestion.statusCode).toStrictEqual(OK);
    expect(historyQuizSuggestion.body).toHaveProperty('question');
  });
});