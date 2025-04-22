
import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAttachment,
  requestAttachmentView
} from './testsHelper';

import {
  ErrorCodes
} from '../src/functionsHelper';

import { describe } from 'node:test';

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

  requestAdminQuizQuestionCreate(
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
        ]
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
});
