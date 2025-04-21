
import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAttachment,
  requestAttachmentView,
  requestGetQuiz,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN
} from './testsHelper';

import { describe } from 'node:test';

const quizIdOffset = 727;
const questionIdOffset = 999;

let session: string;
let quizId: number;
let questionId: number;
let timeCreated: number;

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
  timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseQuizCreate.body.quizId;

  const responseQuestionCreate = requestAdminQuizQuestionCreate(
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
  questionId = responseQuestionCreate.body.questionId;
});

describe('Testing PUT /v1/admin/quiz/{quizid}/qusetion/{questionid}', () => {
  test('Testing correct return value', () => {
    const responseQuestionUpdate = requestAttachmentView(
      session,
      quizId,
      0
    );
    expect(responseQuestionUpdate.body).toStrictEqual({});
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
  });

  test('Intended', () => {
    const responseQuestionUpdate = requestAttachment(
      session,
      quizId,
      'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ=='
    );
    expect(responseQuestionUpdate.body).toStrictEqual({});
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);

    const responseQuiz = requestAttachment(quizId, session);
    expect(responseQuiz.body).toStrictEqual({});
    expect(responseQuiz.statusCode).toStrictEqual(OK);
  });
});
