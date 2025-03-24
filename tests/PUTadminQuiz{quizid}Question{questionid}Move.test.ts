import {
  requestClear,
  responseInterface,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminQuizQuestionMove,
  requestAdminQuizQuestionCreate,
  requestAdminAuthRegister,
  requestAdminQuizCreate
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
let session: string;
let session2: string;
let quizId: number;
let quizId2: number;
let questionId: number;
let questionId2: number;
let questionId3: number;
let newPosition: number;

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

  responseCreateQuestion = requestAdminQuizQuestionCreate(
    quizId,
    session, 
    'Question2'
  );
  questionId2 = responseCreateQuestion.body.questionId2;
});

describe('error 400 test cases', () => {
  test.each([
    {
      description: 'Question Id does not refer to a valid question within this quiz',
      quizId: quizId,
      questionId: questionId + questionIdOffset,
      session: session,
      newPosition: '1'
    },
    {
      description: 'NewPosition is less than 0',
      quizId: quizId,
      questionId: questionId,
      session: session,
      newPosition: '-1'
    },
    {
      description: 'NewPosition is greater than n-1 where n is the number of questions',
      quizId: quizId,
      questionId: questionId,
      session: session,
      newPosition: '5'
    },
    {
      description: ' newPosition is the same as current one',
      quizId: quizId,
      questionId: questionId,
      session: session,
      newPosition: '0'
    }
  ])('$description', ({ quizId, questionId, session, newPosition }) => {
    const invalidQuestionIdres = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session, 
      newPosition
    );
    expect(invalidQuestionIdres.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidQuestionIdres.statusCode).toStrictEqual(BADREQUEST);
  });
});

describe('error 401 cases', () => {

  test('Invalid session', () => {
    const invalidSessionRes = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session + 'Invalid Offset', 
      '1'
    );
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
  });

  test('Session logged out', () => {
    requestAdminAuthLogout(session);
    const invalidSessionRes = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session, 
      '1'
    );
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
  });

  test('Session has no quizzes', () => {
    // new session with no quizes
    responseRegister = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    session2 = responseRegister.body.session2;
    const emptySessionRes = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session2,
      '1'
    );
    expect(emptySessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(emptySessionRes.statusCode).toStrictEqual(UNAUTHORISED);
  });

  describe('error code 403 cases', () => {
    test('Valid session is provided, but user is not an owner of this quiz', () => {
      responseRegister = requestAdminAuthRegister(
        'z7277273@ad.unsw.edu.au',
        'Password2',
        'First2',
        'Last2'
      );
      session2 = responseRegister.body.session;
  
      responseCreate = requestAdminQuizCreate(
        session2,
        'Name2',
        'Description2'
      );
      quizId2 = responseCreate.body.quizId2;

      responseCreateQuestion = requestAdminQuizQuestionCreate(
        quizId2,
        session2, 
        'Question3'
      );
      questionId3 = responseCreateQuestion.body.questionId3;

      const invalidSessionRes = requestAdminQuizQuestionMove(
        quizId2, 
        questionId3, 
        session, 
        '1',
      );
      expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
      expect(invalidSessionRes.statusCode).toStrictEqual(FORBIDDEN);
    }); 
    
    test('Quiz does not exist', () => {
      const invalidQuizIdRes = requestAdminQuizQuestionMove(
        quizId + quizIdOffset, 
        questionId, 
        session, 
        '1',
      );
      expect(invalidQuizIdRes.body).toStrictEqual({ error: expect.any(String) });
      expect(invalidQuizIdRes.statusCode).toStrictEqual(FORBIDDEN);
    });
  });
});

