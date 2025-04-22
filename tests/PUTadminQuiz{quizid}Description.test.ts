import {
  requestClear,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestDeleteQuiz,
  requestAdminQuizUpdateDescription,
  requestGetQuiz
} from './testsHelper';

import {
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let responseQuizGet: responseInterface;
let session: string;
let quizId: number;
let timeCreated: number;

// Before each test clears the data and registers a user, getting the session id
// then creates a quiz and gets the quiz id and quiz details
beforeEach(() => {
  requestClear();
  const responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  const responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;
  responseQuizGet = requestGetQuiz(quizId, session);
});

describe('Testing PUT v1/admin/quiz/{quizid}/description', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      // Updates the description of the quiz
      const responseUpdateDescription = requestAdminQuizUpdateDescription(
        quizId,
        session,
        'New Description'
      );
      // Checks that the response from the update returns an empty object
      // and a status code of 200
      expect(responseUpdateDescription.body).toStrictEqual({});
      expect(responseUpdateDescription.statusCode).toStrictEqual(ErrorCodes.OK);
    });
  });

  describe('Test error cases', () => {
    describe('Testing status code of 401 return values', () => {
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
      const responseUpdateDescription = requestAdminQuizUpdateDescription(
        quizId, session,
        'New Description'
      );
      // Checks that the response when update with invalid session returns an error object
      // and a status code of 401
      expect(responseUpdateDescription.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateDescription.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);

      // To make sure that it does not change existing quiz
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(ErrorCodes.OK);
    });
  });

    test('Testing when the session is valid but the quizId is not', () => {
      const responseQuizGet = requestGetQuiz(quizId, session);
      const responseUpdateDescription = requestAdminQuizUpdateDescription(
        quizId + idOffset,
        session,
        'New Description'
      );
      // Checks that the response from a non-existent quiz returns an error string and
      // a status code of 403
      expect(responseUpdateDescription.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateDescription.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);

      // To make sure that it does not change existing quiz
      const responseQuizGet2 = requestGetQuiz(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);
    });

    test('Invalid quizId - When quiz is not owned by session', () => {
      const responseRegister2 = requestAdminAuthRegister(
        'z72772769@ad.unsw.edu.au',
        'Password2',
        'Firstt',
        'Lastt'
      );

      // Try to update first user's quiz with second user's ID
      const responseUpdateDescription = requestAdminQuizUpdateDescription(
        quizId,
        responseRegister2.body.session,
        'New Description'
      );
      expect(responseUpdateDescription.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateDescription.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });

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
          const responseUpdateDescription = requestAdminQuizUpdateDescription(
            quizId,
            session,
            description
          );
          expect(responseUpdateDescription.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateDescription.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);

          // Check that quiz description has not been changed
          const responseQuizGet2 = requestGetQuiz(quizId, session);
          expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
          expect(responseQuizGet2.statusCode).toStrictEqual(ErrorCodes.OK);
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
        ])('Valid description - $reason', ({ description }) => {
          const responseUpdateDescription = requestAdminQuizUpdateDescription(
            quizId,
            session,
            description
          );
          const timeEdited = Math.floor(Date.now() / 1000);
          expect(responseUpdateDescription.body).toStrictEqual({});
          expect(responseUpdateDescription.statusCode).toStrictEqual(ErrorCodes.OK);

          // To make sure that description is actually updated
          const responseQuizGet2 = requestGetQuiz(quizId, session);
          expect(responseQuizGet2.body).toStrictEqual({
            quizId: quizId,
            name: 'Name',
            timeCreated: timeCreated,
            timeLastEdited: timeEdited,
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
    const responseUpdateDescription = requestAdminQuizUpdateDescription(
      quizId,
      session,
      'New Description'
    );
    const timeEdited = Math.floor(Date.now() / 1000);
    expect(responseUpdateDescription.body).toStrictEqual({});
    expect(responseUpdateDescription.statusCode).toStrictEqual(ErrorCodes.OK);

    // Check details after update
    const responseQuizGet2 = requestGetQuiz(quizId, session);
    expect(responseQuizGet2.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      description: 'New Description',
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(responseQuizGet2.statusCode).toStrictEqual(ErrorCodes.OK);

    // Deletes the quiz
    requestDeleteQuiz(quizId, session);

    // Should be unavailable after deletion
    const responseQuizGet3 = requestGetQuiz(quizId, session);
    expect(responseQuizGet3.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizGet3.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
  });
});
