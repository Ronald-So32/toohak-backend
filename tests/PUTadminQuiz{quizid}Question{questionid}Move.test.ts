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
let responseQuestionCreate: responseInterface;
let session: string;
let session2: string;
let quizId: number;
let quizId2: number;
let questionId: number;
let questionId2: number;
let questionId3: number;

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
  
  responseQuestionCreate = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Question',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Right',
            correct: true
          },
          {
            answer: 'Wrong',
            correct: false
          }
        ]
      }
    }
  );


  responseQuestionCreate = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Question2',
        timeLimit: 5,
        points: 6,
        answerOptions: [
          {
            answer: 'Right',
            correct: true
          },
          {
            answer: 'Wrong',
            correct: false
          }
        ]
      }
    }
  );
  questionId2 = responseQuestionCreate.body.questionId;
});

describe('error 400 test cases', () => {
  test.each([
    {
      description: 'Question Id does not refer to a valid question within this quiz',
      quizId: quizId,
      questionId: questionId + questionIdOffset,
      session: session,
      newPosition: 1
    },
    {
      description: 'NewPosition is less than 0',
      quizId: quizId,
      questionId: questionId,
      session: session,
      newPosition: -1
    },
    {
      description: 'NewPosition is greater than n-1 where n is the number of questions',
      quizId: quizId,
      questionId: questionId,
      session: session,
      newPosition: 5
    },
    {
      description: ' newPosition is the same as current one',
      quizId: quizId,
      questionId: questionId,
      session: session,
      newPosition: 0
    }
  ])('$description', ({ quizId, questionId, session, newPosition }) => {
    const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session, 
      newPosition
    );
    expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(responseMoveQuizQuestion.statusCode).toStrictEqual(BADREQUEST);
  });
});

describe('error 401 cases', () => {

  test('Invalid session', () => {
    const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session + 'Invalid Offset', 
      1
    );
    expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(responseMoveQuizQuestion.statusCode).toStrictEqual(UNAUTHORISED);
  });

  test('Session logged out', () => {
    requestAdminAuthLogout(session);
    const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session, 
      1
    );
    expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(responseMoveQuizQuestion.statusCode).toStrictEqual(UNAUTHORISED);
  });

  test('Session has no quizzes', () => {
    // new session with no quizes
    responseRegister = requestAdminAuthRegister(
      'z7277272@ad.unsw.edu.au',
      'Password1',
      'First',
      'Last'
    );
    session2 = responseRegister.body.session;
    const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session2,
      1
    );
    expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
    expect(responseMoveQuizQuestion.statusCode).toStrictEqual(UNAUTHORISED);
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

      responseQuestionCreate = requestAdminQuizQuestionCreate(
        quizId2,
        session2, 
        'Question3'
      );
      questionId3 = responseQuestionCreate.body.questionId3;

      const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
        quizId2, 
        questionId3, 
        session,
        1,
      );
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(FORBIDDEN);
    }); 
    
    test('Quiz does not exist', () => {
      const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
        quizId + quizIdOffset, 
        questionId, 
        session, 
        1,
      );
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(FORBIDDEN);
    });
  });
});

describe('Valid case', () => {
  test('Session, quizId, questionId, and newPosition is valid', () => {
    const res = requestAdminQuizQuestionMove(
      quizId, 
      questionId, 
      session, 
      1,
    );
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toStrictEqual(OK);
  });
});
