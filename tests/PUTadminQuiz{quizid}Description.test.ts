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
let responseQuizGet: responseInterface;
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
    'Name',
    'Description'
  );
  quizId = responseCreate.body.quizId;
  responseQuizGet = requestGetQuiz(quizId, session);
});

describe('Testing PUT v1/admin/quiz/{quizid}/description', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      const responseUpdateDescription = requestAdminQuizUpdateDescription(
        quizId,
        session,
        'New Description'
      );
      expect(responseUpdateDescription.body).toStrictEqual({});
      expect(responseUpdateDescription.statusCode).toStrictEqual(OK);
    });
  });

  describe('Test error cases', () => {
    test('Testing when the session is invalid', () => {
      const responseUpdateDescription = requestAdminQuizUpdateDescription(
        quizId, session + 'Invalid Session',
        'New Description'
      );
      expect(responseUpdateDescription.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateDescription.statusCode).toStrictEqual(UNAUTHORISED);

      // To make sure that it does not change existing quiz
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet.statusCode).toStrictEqual(OK);
    });

    test('Testing when the session is valid but the quizId is not', () => {
      const responseQuizGet = requestGetQuiz(quizId, session);
      const responseUpdateDescription = requestAdminQuizUpdateDescription(
        quizId + quizIdOffset,
        session,
        'New Description'
      );
      expect(responseUpdateDescription.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateDescription.statusCode).toStrictEqual(FORBIDDEN);

      // To make sure that it does not change existing quiz
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet.statusCode).toStrictEqual(OK);
    });

    test('Invalid quizId - When quiz is not owned by session', () => {
      responseRegister = requestAdminAuthRegister(
        'z7277273@ad.unsw.edu.au',
        'Password2',
        'First2',
        'Last2'
      );

      // Create a quiz for first user
      responseCreate = requestAdminQuizCreate(
        session,
        'Quiz for Ownership Test',
        'Description'
      );
      
      // Try to update first user's quiz with second user's ID
      const responseUpdateDescription = requestAdminQuizUpdateDescription(
        responseCreate.body.quizId,
        responseRegister.body.session,
        'New Description'
      );
      expect(responseUpdateDescription.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateDescription.statusCode).toStrictEqual(FORBIDDEN);
    });

    // To test the validity of descriptions
    describe('Test validity of Description', () => {
      describe('Invalid cases', () => {
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
          const responseQuizGet = requestGetQuiz(quizId, session);
          const responseUpdateDescription = requestAdminQuizUpdateDescription(
            quizId, 
            session, 
            description
          )
          expect(responseUpdateDescription.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateDescription.statusCode).toStrictEqual(BADREQUEST);

          // check that quiz description has not been changed 
          const responseQuizGet2 = requestGetQuiz(quizId, session);
          expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
          expect(responseQuizGet.statusCode).toStrictEqual(OK);
        });
      });

      describe('Valid cases', () => {
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
          const responseUpdateDescription = requestAdminQuizUpdateDescription(
            quizId, 
            session, 
            description
          )
          expect(responseUpdateDescription.body).toStrictEqual({ });
          expect(responseUpdateDescription.statusCode).toStrictEqual(OK);

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
  });

  test('Testing PUT v1/admin/quiz/{quizid}/description works as intended', () => {
    // TODO
  });
});
  