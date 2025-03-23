import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizUpdateName,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
const quizIdOffset = 727;

let responseRegister: responseInterface;
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
  const responseCreate = requestAdminQuizCreate(
    session,
    'Quiz Name',
    'Quiz Description'
  );
  quizId = responseCreate.body.quizId;
});

describe('Testing PUT /v1/admin/quiz/{quizid}/name', () => {
  test('Testing the code 200 return value', () => {
    const responseUpdate = requestAdminQuizUpdateName(
      quizId,
      session,
      'New Quiz Name'
    );
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseUpdate = requestAdminQuizUpdateName(
        quizId,
        session + 'Invalid Session',
        'New Quiz Name'
      );
      expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdate.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when the quizId is invalid', () => {
      const responseUpdate = requestAdminQuizUpdateName(
        quizId + quizIdOffset,
        session,
        'New Quiz Name'
      );
      expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdate.statusCode).toStrictEqual(FORBIDDEN);
    });

    test('Testing when the user is not the owner of the quiz', () => {
      // Register a second user
      const responseRegister2 = requestAdminAuthRegister(
        'another@example.com',
        'Password1',
        'Another',
        'User'
      );
      const session2 = responseRegister2.body.session;

      // Try to update the quiz name with the second user's session
      const responseUpdate = requestAdminQuizUpdateName(
        quizId,
        session2,
        'New Quiz Name'
      );
      expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdate.statusCode).toStrictEqual(FORBIDDEN);
    });

    describe('Testing the quiz name validation', () => {
      describe('Invalid cases', () => {
        test.each([
          {
            description: 'Contains invalid characters',
            name: 'Quiz@Name123!',
          },
          {
            description: 'Too short (less than 3 characters)',
            name: 'Qz',
          },
          {
            description: 'Too long (more than 30 characters)',
            name: 'This Quiz Name Is Wayyyyyyyyyyy Too Long And Should Fail Validation',
          },
        ])('Invalid quiz name - $description', ({ name }) => {
          const responseUpdate = requestAdminQuizUpdateName(
            quizId,
            session,
            name
          );
          expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdate.statusCode).toStrictEqual(BADREQUEST);
        });
      });
    });
  });
});