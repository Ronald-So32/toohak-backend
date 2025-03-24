import {
  requestClear,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestDeleteQuiz,
  requestAdminQuizUpdateDescription,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
const quizIdOffset = 727;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let session: string;
let session2: string;
let quizId: number;
let quizId2: number;

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
    'Name',
    'Description'
  );
  quizId = responseCreate.body.quizId;
});

describe('Test correct return type and normal usage case', () => {
  test('Testing the code 200 return value', () => {
    const updateQuizDescription = requestAdminQuizUpdateDescription(quizId, session, 'New Description');
    expect(updateQuizDescription.body).toStrictEqual({});
    expect(updateQuizDescription.statusCode).toStrictEqual(OK);
  });
});


describe('Test error cases', () => {
  test('Testing when the session is invalid', () => {
    const invalidIdres = requestAdminQuizUpdateDescription(quizId, session + 'Invalid Session', 'New Description');
    expect(invalidIdres.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidIdres.statusCode).toStrictEqual(UNAUTHORISED);
    // To make sure that it doe not change any existing quiz
    const checkInfo = requestGetQuiz(quizId, session);
    expect(checkInfo.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(checkInfo.statusCode).toStrictEqual(OK);
  });

  test('Testing when the session is valid but the quizId is not', () => {
    const responseDeleteQuiz = requestDeleteQuiz(quizId + quizIdOffset, session);
    expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
    expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
    // To make sure that it does not change any exist quiz of the user
    const checkInfo = requestGetQuiz(quizId, session);
    expect(checkInfo.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(checkInfo.statusCode).toStrictEqual(OK);
  });

  test('Invalid quizId - When quiz is not owned by session', () => {
    responseRegister = requestAdminAuthRegister(
      'z7277273@ad.unsw.edu.au',
      'Password2',
      'First2',
      'Last2'
    );
    session2 = responseRegister.body.session;
    // Create a quiz for first user
    responseCreate = requestAdminQuizCreate(
    session,
    'Quiz for Ownership Test',
    'Description'
    );
    quizId2 = responseCreate.body.quizId2;
    // Try to update first user's quiz with second user's ID
    const invalidIdres = requestAdminQuizUpdateDescription(quizId2, session2, 'New Description');
    expect(invalidIdres.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidIdres.statusCode).toStrictEqual(FORBIDDEN);
  });

  // To test the validity of descriptions
  describe('Test validity of Description', () => {
    // To test the Invalid descriptions
    test.each([
      {
        description: 'ab 12 '.repeat(20) + '! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description is more than 100 characters with normal spaces'
      },
      {
        description: ' ab 12'.repeat(20) + '! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description is more than 100 characters with spaces at the front'
      },
      {
        description: 'aB 12 '.repeat(20) + '! @ # $ % ^ & * ( ) _ + - = ',
        reason: 'Description is more than 100 characters with spaces at the end'
      },
    ])('Invalid description - $reason', ({ description }) => {
      // responseCreate = requestAdminQuizCreate(
      //   session,
      //   'Name',
      //   'Valid Description'
      //   );
      // quizId = responseCreate.body.quizId;

      const resposneUpdate = requestAdminQuizUpdateDescription(
        quizId, 
        session, 
        description
      )
      expect(resposneUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(resposneUpdate.statusCode).toStrictEqual(BADREQUEST);
      // check that quiz description has not been changed 
      const infoBefore = requestGetQuiz(quizId, session);
      expect(requestGetQuiz(quizId, session)).toStrictEqual(infoBefore);
    });

    // To test valid descriptions
    test.each([
      {
        description: '',
        reason: 'Empty string'
      },
      {
        description: 'aB 12 '.repeat(12) + ' ! @ # $ % ^ & * ( ) _ + - =',
        reason: 'Description with 100 characters'
      },
    ])('Valid description - $reason', ({ description}) => {
      const resposneCorrectUpdate = requestAdminQuizUpdateDescription(
        quizId, 
        session, 
        description
      )
      expect(resposneCorrectUpdate.body).toStrictEqual({ });
      expect(resposneCorrectUpdate.statusCode).toStrictEqual(OK);
      // // To make sure that description is actually updated
      const responseQuizGet = requestGetQuiz(quizId, session);
      expect(responseQuizGet.body).toStrictEqual({
        quizId: quizId,
        name: 'Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: description,
        numQuestions: 0,
        questions: [],
        timeLimit: 0
      });
    });
  });
});
