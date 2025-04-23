
import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAttachment
} from './testsHelper';

import {
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;

// Before each test clears the data and registers a user and creates a quiz
// and question and gets the current session, quiz id and question id
beforeEach(() => {
  requestClear();
  const responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;

  const responseQuizCreate = requestAdminQuizCreate(
    session,
    'Quiz Name',
    'Description'
  );
  quizId = responseQuizCreate.body.quizId;

  requestAdminQuizQuestionCreateV2(
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
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
  );
});

describe('Testing PUT /v1/admin/quiz/{quizid}/qusetion/{questionid}', () => {
  test('Testing correct return value', () => {
    const responseQuestionUpdate = requestAttachment(
      session,
      quizId,
      'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=='
    );
    expect(responseQuestionUpdate.body).toStrictEqual({});
    expect(responseQuestionUpdate.statusCode).toStrictEqual(ErrorCodes.OK);
  });

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
      const responseQuestionUpdate = requestAttachment(
        session,
        quizId,
        'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=='
      );
      expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionUpdate.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
    });
  });

  describe('Testing status code of 403 return values', () => {
    test('Testing when quiz is does not exist', () => {
      const responseQuestionUpdate = requestAttachment(
        session,
        quizId + idOffset,
        'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=='
      );
      expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionUpdate.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });

    test('Testing when quiz is not owned by user', () => {
      session = requestAdminAuthRegister(
        'z7277271@ad.unsw.edu.au',
        'Password1',
        'First',
        'Last'
      ).body.session;

      const responseQuestionUpdate = requestAttachment(
        session,
        quizId,
        'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=='
      );
      expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionUpdate.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });
  });
});
