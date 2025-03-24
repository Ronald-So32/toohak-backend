import {
  requestClear,
  responseInterface,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminQuizQuestionMove,
  requestAdminQuizQuestionCreate
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
  test('Question Id does not refer to a valid question within this quiz', () => {
    const invalidQuestionIdres = requestAdminQuizQuestionMove(quizId, questionId + questionIdOffset, session, '1');
    expect(invalidQuestionIdres.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidQuestionIdres.statusCode).toStrictEqual(BADREQUEST);
  })

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

})

