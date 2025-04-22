import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizUpdateName,
  requestGetQuiz
} from './testsHelper';

import {
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let responseRegister: responseInterface;
let session: string;
let quizId: number;

// Before each test clears the data and registers a user, obtaining the
// session and creates a quiz getting the quiz id
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
    // Updates the name of the user's quiz
    const responseUpdate = requestAdminQuizUpdateName(
      quizId,
      session,
      'New Quiz Name'
    );
    // Checks that the response from a name update returns an empty object
    // and a status code of 200
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
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
        const responseUpdate = requestAdminQuizUpdateName(
          quizId,
          session + 'Invalid Session',
          'New Quiz Name'
        );
        // Checks that an invalid session returns an error object and a status code
        // of 401
        expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    test('Testing when the quizId is invalid', () => {
      const responseUpdate = requestAdminQuizUpdateName(
        quizId + idOffset,
        session,
        'New Quiz Name'
      );
      // Checks that the non-existent quiz returns an error object and a status code
      // of 403
      expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
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
      expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });

    describe('Testing the quiz name validation', () => {
      test('Quiz name is already used by the same user for another quiz', () => {
        // Create another quiz with a different name
        const responseCreate2 = requestAdminQuizCreate(
          session,
          'Another Quiz',
          'Another Description'
        );
        const quizId2 = responseCreate2.body.quizId;

        // Try to update the second quiz's name to match the first quiz
        const responseUpdate = requestAdminQuizUpdateName(
          quizId2,
          session,
          'Quiz Name'
        );
        expect(responseUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
      });

      describe('Invalid cases', () => {
        test.each([
          {
            description: 'Contains invalid characters',
            name: 'Quiz@Name123!',
          },
          {
            name: 'Hi',
            description: 'Name is too short without spaces'
          },
          {
            name: ' I',
            description: 'Name is too short with spaces'
          },
          {
            name: '',
            description: 'Name is too short empty string'
          },
          {
            name: 'HiIamQuiz1234567890abcdefghijkl',
            description: 'Name is too long with no spaces'
          },
          {
            name: ' Hi I am Quiz 1234567890 abcdef',
            description: 'Name is too long with spaces at front'
          },
          {
            name: 'Hi I am Quiz 1234567890 abcdef ',
            description: 'Name is too long with spaces at end'
          },
          {
            name: 'Hi I am Quiz 123 456 7890 abc def',
            description: 'Name is too long with normal spaces'
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
          expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });
    });

    describe('Valid cases', () => {
      test.each([
        {
          description: 'Standard quiz name',
          name: 'Valid Quiz Name',
        },
        {
          description: 'Quiz name with numbers',
          name: 'Quiz Name 123',
        },
        {
          description: 'Quiz name with exactly 3 characters',
          name: 'Qui',
        },
        {
          description: 'Quiz name with exactly 30 characters',
          name: 'This is exactly thirty charsss',
        },
        {
          name: 'And',
          reason: 'Name has 3 more valid characters with no spaces'
        },
        {
          name: 'H i',
          reason: 'Name 1 with 3 more valid characters with spaces'
        },
        {
          name: ' Hi',
          reason: 'Name 2 with 3 more valid characters with spaces'
        },
        {
          name: 'Hi ',
          reason: 'Name 3 with 3 more valid characters with spaces'
        },
        {
          name: ' I ',
          reason: 'Name 4 with 3 more valid characters with spaces'
        },
        {
          name: 'HiIamQuiz1234567890abcdefghijk',
          reason: 'Name with 30 or less valid characters with no spaces'
        },
        {
          name: ' Hi I am Quiz 1234567890 abcde',
          reason: 'Name with 30 or less valid characters with spaces at front'
        },
        {
          name: 'Hi I am Quiz 1234567890 abcde ',
          reason: 'Name with 30 or less valid characters with spaces at end'
        },
        {
          name: 'Hi I am Quiz 12345 67890 abcde',
          reason: 'Name with 30 or less valid characters with normal spaces'
        },
      ])('Valid quiz name - $description', ({ name }) => {
        const responseUpdate = requestAdminQuizUpdateName(
          quizId,
          session,
          name
        );
        expect(responseUpdate.body).toStrictEqual({});
        expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.OK);
      });
    });
  });

  test('Testing PUT /v1/admin/quiz/{quizid}/name works as intended', () => {
    // Update the quiz name
    const newQuizName = 'Updated Quiz Name';
    const responseUpdate = requestAdminQuizUpdateName(
      quizId,
      session,
      newQuizName
    );
    const timeEdited = Math.floor(Date.now() / 1000);
    expect(responseUpdate.body).toStrictEqual({});
    expect(responseUpdate.statusCode).toStrictEqual(ErrorCodes.OK);

    // Verify the quiz name has been updated
    const responseQuizGet = requestGetQuiz(quizId, session);
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);
    expect(responseQuizGet.body.name).toStrictEqual(newQuizName);

    // Verify timeLastEdited has been updated
    expect(responseQuizGet.body.timeLastEdited).toStrictEqual(timeEdited);

    // Verify other properties remain unchanged
    expect(responseQuizGet.body.quizId).toStrictEqual(quizId);
    expect(responseQuizGet.body.description).toStrictEqual('Quiz Description');
  });
});
