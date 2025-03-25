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
    /* For this specific test case, we use different contents since its testing
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
});