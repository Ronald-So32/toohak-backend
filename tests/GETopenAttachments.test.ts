
import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAttachment,
  requestAttachmentView
} from './testsHelper';

import {
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';
import { error } from 'console';

let session: string;
let quizId: number;
// let questionId: number;
// let timeCreated: number;

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

  requestAttachment(
    session,
    quizId,
    'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=='
  );
});

describe('Testing PUT /v1/admin/quiz/{quizid}/qusetion/{questionid}', () => {
  test('Testing correct return value', () => {
    const responseQuiz = requestAttachmentView(session, quizId, 0);
    expect(responseQuiz.body).toStrictEqual(
      'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=='
    );
    expect(responseQuiz.statusCode).toStrictEqual(ErrorCodes.OK);
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
        const responseQuiz = requestAttachmentView(session, quizId, 0);
        expect(responseQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuiz.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseQuiz = requestAttachmentView(session, quizId + idOffset, 0);
        expect(responseQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuiz.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        const responseQuiz = requestAttachmentView(session, quizId + idOffset, 0);
        expect(responseQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuiz.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });
    });

    describe('Testing invalid attachmentNumber', () => {
      test.each([
        {
          attachmentNumber: -1,
          description: 'attachmentNumber < 0',
        },
        {
          attachmentNumber: 3,
          description: 'attachmentNumber >= attachments length',
        }
      ])('$description', ({ attachmentNumber }) => {
        const responseQuiz = requestAttachmentView(session, quizId, attachmentNumber);
        expect(responseQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuiz.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
      });

      test('Testing when there is no attachment', () => {
        quizId = requestAdminQuizCreate(
          session,
          'Quiz',
          'Description'
        ).body.quizId;
        const responseQuiz = requestAttachmentView(session, quizId, 0);
        expect(responseQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuiz.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
      });
    });
})
  
});
