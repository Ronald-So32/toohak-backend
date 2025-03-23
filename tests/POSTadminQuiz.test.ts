import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
/* requestAdminQuizList,
  requestGetUserQuizDetails */
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
let session: string;

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
});

describe('Placeholder test suite', () => {
  test('should pass', () => {
    expect(true).toBe(true); // This test will always pass
  });
});

describe('Testing POST /v1/admin/quiz', () => {
  test('Testing the return value', () => {
    const responseQuizCreate = requestAdminQuizCreate(
      session,
      'My Quiz Name',
      'A description of my quiz'
    );
    expect(responseQuizCreate.body).toStrictEqual({ session: expect.any(String) });
    expect(responseQuizCreate.statusCode).toStrictEqual(OK);
  });
});

describe('Testing POST /v1/admin/quiz', () => {
  test('Testing for invalid session', () => {
    const responseQuizCreate = requestAdminQuizCreate(
      session + 'Invalid Session',
      'My Quiz Name',
      'A description of my quiz'
    );

    expect(responseQuizCreate.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizCreate.statusCode).toStrictEqual(UNAUTHORISED);
  })

  describe('Testing the names', () => {
    test('Name already used by the user', () => {
      let responseQuizCreate = requestAdminQuizCreate(
        session,
        'My Quiz Name',
        'A description of my quiz'
      );
      expect(responseQuizCreate.body).toStrictEqual({ session: expect.any(String) });
      expect(responseQuizCreate.statusCode).toStrictEqual(OK);

      responseQuizCreate = requestAdminQuizCreate(
        session,
        'My Quiz Name',
        'A description of my quiz'
      );
      expect(responseQuizCreate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizCreate.statusCode).toStrictEqual(BADREQUEST);
    });

    describe('Valid quiz names', () => {
      test.each([
        {
          name: 'Qui',
          reason: 'Containing exactly 3 characters'
        },
        {
          name: 'Quizz'.repeat(6),
          reason: 'Containing exactly 30 characters'
        },
        {
          name: 'Quiz Name',
          reason: 'Containing space'
        },
        {
          name: 'QuizName',
          reason: 'Containing no space'
        },
        {
          name: 'Qu iz Na me',
          reason: 'Containing multiple space'
        },
        {
          name: 'Quiz123',
          reason: 'Quiz name with numbers'
        },
        {
          name: 'Quiz 123',
          reason: 'Quiz name with numbers and space'
        },
        {
          name: '12345678',
          reason: 'Containing only number'
        },
        {
          name: 'Qu ',
          reason: 'Name with 3 characters and space at the end'
        },
        {
          name: 'Qu ',
          reason: 'Name with 3 characters and space at the front'
        },
        {
          name: ' Q ',
          reason: 'Name with 3 characters and spaces at the front and end'
        },
      ])('$reason', ({ name }) => {
        const responseQuizCreate = requestAdminQuizCreate(
          session,
          name,
          'A description of my quiz'
        );
    
        expect(responseQuizCreate.body).toStrictEqual({ session: expect.any(String) });
        expect(responseQuizCreate.statusCode).toStrictEqual(OK);
      });
    });
  });

  describe('Invalid quiz names', () => {
    test.each([
      {
        name: 'Qu',
        reason: 'Containing less then 3 characters'
      },
      {
        name: 'Quizz'.repeat(7),
        reason: 'Containing more then 30 characters'
      },
      {
        name: '',
        reason: 'Empty string'
      },
      {
        name: '@Quiz_Name!!!',
        reason: 'Containing invalid characters'
      },
      {
        name: '!@#$%^&*()',
        reason: 'Containing only invalid characters'
      },
    ])('$reason', ({ name }) => {
      const responseQuizCreate = requestAdminQuizCreate(
        session,
        name,
        'A description of my quiz'
      );
  
      expect(responseQuizCreate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizCreate.statusCode).toStrictEqual(BADREQUEST);
    });
  });
  

});