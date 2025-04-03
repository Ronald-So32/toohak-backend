import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestGetQuizList,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;

let responseRegister: responseInterface;
let session: string;

// Before each test clears the data and registers a user and obtains the current session
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

describe('Testing POST /v1/admin/quiz', () => {
  test('Testing the return value', () => {
    // Creates a quiz and save it's response
    const responseQuizCreate = requestAdminQuizCreate(
      session,
      'My Quiz Name',
      'A description of my quiz'
    );
    // Checks that the response returns an quizId object and a status code of 200
    expect(responseQuizCreate.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(responseQuizCreate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing for invalid session', () => {
      const responseQuizCreate = requestAdminQuizCreate(
        session + 'Invalid Session',
        'My Quiz Name',
        'A description of my quiz'
      );
      // Checks that unotherised attempt to create quiz returns an eror object and a
      // status code 401
      expect(responseQuizCreate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizCreate.statusCode).toStrictEqual(UNAUTHORISED);
    });

    describe('Testing the names', () => {
      test('Name already used by the user', () => {
        let responseQuizCreate = requestAdminQuizCreate(
          session,
          'My Quiz Name',
          'A description of my quiz'
        );
        expect(responseQuizCreate.body).toStrictEqual({ quizId: expect.any(Number) });
        expect(responseQuizCreate.statusCode).toStrictEqual(OK);

        responseQuizCreate = requestAdminQuizCreate(
          session,
          'My Quiz Name',
          'A description of my quiz'
        );
        // Checkts that a bad request returns an error object and a status code of 400
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

          expect(responseQuizCreate.body).toStrictEqual({ quizId: expect.any(Number) });
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

    describe('Testing the description', () => {
      describe('Invalid description', () => {
        test.each([
          {
            description: 'aB 12 '.repeat(20) + ' ! @ # $ % ^ & * ( ) _ + - =',
            reason: 'Description with more then 100 characters with normal spaces'
          },
          {
            description: ' ab 12'.repeat(20) + '! @ # $ % ^ & * ( ) _ + - =',
            reason: 'Description with more then 100 characters with spaces at the front'
          },
          {
            description: ' ab 12'.repeat(20) + '! @ # $ % ^ & * ( ) _ + - =',
            reason: 'Description with more then 100 characters with spaces at the end'
          },
        ])('$reason', ({ description }) => {
          const responseQuizCreate = requestAdminQuizCreate(
            session,
            'Quiz Name',
            description
          );

          expect(responseQuizCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuizCreate.statusCode).toStrictEqual(BADREQUEST);
        });
      });

      describe('Valid description', () => {
        test.each([
          {
            description: 'aB 12 '.repeat(12) + ' ! @ # $ % ^ & * ( ) _ + - =',
            reason: 'Containing exactly 100 characters'
          },
          {
            description: '',
            reason: 'Empty string'
          },
        ])('$reason', ({ description }) => {
          const responseQuizCreate = requestAdminQuizCreate(
            session,
            'Quiz Name',
            description
          );

          expect(responseQuizCreate.body).toStrictEqual({ quizId: expect.any(Number) });
          expect(responseQuizCreate.statusCode).toStrictEqual(OK);
        });
      });
    });
  });

  test('Testing POST /v1/admin/quiz works as intended', () => {
    const responseQuizCreate = requestAdminQuizCreate(
      session,
      'Quiz Name',
      'Description'
    );
    const id = responseQuizCreate.body.quizId;
    expect(responseQuizCreate.body).toStrictEqual({ quizId: expect.any(Number) });
    expect(responseQuizCreate.statusCode).toStrictEqual(OK);

    // Gets the details of the quiz created
    const responseQuizDetails = requestGetQuiz(id, session);
    // Checks that the details of the quiz is correct and has a status code of 200
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: id,
      name: 'Quiz Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 0,
      questions: [],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);

    // Gets the list of quiz that the current user has
    const responseQuizList = requestGetQuizList(session);
    // Checks that the list of quiz is correct and has a status code of 200
    expect(responseQuizList.body).toStrictEqual({
      quizzes: [
        {
          quizId: id,
          name: 'Quiz Name'
        }
      ]
    });
    expect(responseQuizList.statusCode).toStrictEqual(OK);
  });
});
