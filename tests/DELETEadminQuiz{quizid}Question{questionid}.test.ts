import {
  requestClear,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestAdminQuizQuestionCreate,
  requestDeleteQuizQuestion,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';


const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
const quizIdOffset = 727;
const questionIdOffset = 999;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let responseCreateQuestion: responseInterface;
let beforeInfo: responseInterface;
let session: string;
let session2: string;
let quizId: number;
let quizId2: number;
let questionId: number;
let questionId2: number;

describe('error case 401 tests', () => {

  beforeEach(() => {
    // Make other session
    responseRegister = requestAdminAuthRegister(
      'z7277273@ad.unsw.edu.au',
      'Password2',
      'First2',
      'Last2'
    );
    session2 = responseRegister.body.session;
    beforeInfo = requestGetQuiz(quizId2, session);
  });
  test('Session is invalid', () => {
    beforeInfo = requestGetQuiz(quizId, session);
    const invalidSessionRes = requestDeleteQuizQuestion(quizId, questionId, session + 'Invalid Session');
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
    // check quiz has not been deleted 
    const afterInfo = requestGetQuiz(quizId, session);
    expect(afterInfo.body).toStrictEqual(beforeInfo.body);
    expect(afterInfo.statusCode).toStrictEqual(OK);
  });

  // not logged in user
  test('Session is invalid', () => {
    // login to make quiz and question
    requestAdminAuthLogin('z7277273@ad.unsw.edu.au','Password2');
    // make other quiz
    responseCreate = requestAdminQuizCreate(
      session2,
      'Name2',
      'Description2'
    );
    quizId2 = responseCreate.body.quizId;
    // make question under quiz 2
    responseCreateQuestion = requestAdminQuizQuestionCreate(
      quizId2,
      session2, 
      'Question2'
    );
    questionId2 = responseCreateQuestion.body.questionId;
    // logout session2
    requestAdminAuthLogout(session2);
    // Test not logged in session will have question deleted
    const invalidSessionRes = requestDeleteQuizQuestion(quizId2, questionId2, session2);
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);

    //login to check info
    requestAdminAuthLogin('z7277273@ad.unsw.edu.au','Password2');
    const checkInfo = requestGetQuiz(quizId2, session2);
    expect(checkInfo.body).toStrictEqual({
      quizId: quizId,
      name: 'Name2',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description2',
      numQuestions: 1,
      questions: ['Question2'],
      timeLimit: 0
    });
    expect(checkInfo.statusCode).toStrictEqual(OK);
  });

  test('Session is empty - session has quiz but no questions', () => {
    // login to make quiz and question
    requestAdminAuthLogin('z7277273@ad.unsw.edu.au','Password2');
    // make other quiz
    responseCreate = requestAdminQuizCreate(
      session2,
      'Name2',
      'Description2'
    );
    quizId2 = responseCreate.body.quizId;
    // no questions made
    const invalidSessionRes = requestDeleteQuizQuestion(quizId2, questionId2, session2);
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
  });

  test('Session is empty - session has no quizzes', () => {
    // no quizzes made
    const invalidSessionRes = requestDeleteQuizQuestion(quizId2, questionId2, session2);
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
  });
});

// make session, login to make quiz and question
beforeEach(() => {
  requestClear();

  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;

  requestAdminAuthLogin('z7277272@ad.unsw.edu.au','Password1');

  responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseCreate.body.quizId;
  
  responseCreateQuestion = requestAdminQuizQuestionCreate(
    quizId,
    session, 
    'Question'
  );
  questionId = responseCreateQuestion.body.questionId;
  beforeInfo = requestGetQuiz(quizId);
  expect(beforeInfo.statusCode).toStrictEqual(OK);
});

describe('Test valid case', () => {
  const res = requestDeleteQuizQuestion(quizId, questionId, session);
  expect(res.body).toStrictEqual({});
  expect(res.statusCode).toStrictEqual(OK);
});

afterEach(() => {
  // check quiz has not been deleted 
  const afterInfo = requestGetQuiz(quizId, session);
  expect(afterInfo.body).toStrictEqual(beforeInfo.body);
  expect(afterInfo.statusCode).toStrictEqual(OK);
})

describe('Test error cases', () => {
  // error 400 
  // questionId that is to be deleted not under same quizId
  test('Question Id does not refer to a valid question within this quiz - question is under different quizId', () => {
    
    // Make other quiz
    responseCreate = requestAdminQuizCreate(
      session,
      'Name2',
      'Description2'
    );
    quizId2 = responseCreate.body.quizId;

    // Make question in other quiz under same session
    responseCreateQuestion = requestAdminQuizQuestionCreate(
      quizId2,
      session, 
      'Question2'
    );
    questionId2 = responseCreateQuestion.body.questionId;

    // case: delete question that is not under same quizId, should equal 400 error
    const invalidIdRes = requestDeleteQuizQuestion(quizId, questionId2, session);
    expect(invalidIdRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidIdRes.statusCode).toStrictEqual(BADREQUEST);
  });

  // question with invalid questionId(non-existent question)
  test('Question Id does not refer to a valid question within this quiz - non-existent questionId', () => {
    const invalidIdRes = requestDeleteQuizQuestion(quizId, questionId + questionIdOffset, session);
    expect(invalidIdRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidIdRes.statusCode).toStrictEqual(BADREQUEST);
  });

  // error 403
  test('Valid session is provided, but user is not an owner of this quiz', () => {
    // Make other session
    responseRegister = requestAdminAuthRegister(
      'z7277273@ad.unsw.edu.au',
      'Password2',
      'First2',
      'Last2'
    );
    session2 = responseRegister.body.session;
    // login first to make quiz under session2 
    requestAdminAuthLogin('z7277273@ad.unsw.edu.au','Password2');
    // Make other quiz under session2 
    responseCreate = requestAdminQuizCreate(
      session2,
      'Name2',
      'Description2'
    );
    quizId2 = responseCreate.body.quizId;
    // Case: valid quizId, but session provided to delete quiz question is invalid
    const invalidQuestionIdRes = requestDeleteQuizQuestion(quizId2, questionId, session);
    expect(invalidQuestionIdRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidQuestionIdRes.statusCode).toStrictEqual(FORBIDDEN);
  });

  test('Valid session is provided, but quiz does not exist', () => {
    // quizId + quizIdOffset = non-existent quiz
    const invalidQuizIdRes = requestDeleteQuizQuestion(quizId + quizIdOffset, questionId, session);
    expect(invalidQuizIdRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidQuizIdRes.statusCode).toStrictEqual(FORBIDDEN);
  })
});
