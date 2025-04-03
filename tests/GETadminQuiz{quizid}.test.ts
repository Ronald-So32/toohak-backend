import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestGetQuizList,
  requestAdminQuizCreate,
  requestDeleteQuiz,
  requestAdminQuizQuestionCreate,
  requestGetQuiz,
  requestAdminQuizUpdateName,
  requestAdminQuizUpdateDescription,
  requestAdminQuizQuestionUpdate,
  requestDeleteQuizQuestion
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let responseQuestionCreate: responseInterface;
let session: string;
let quizId: number;
let questionId: number;

// Before each test clears the data then registers a user, creating a quiz
// with a question, obtaining the current session, the quizId and the questionId
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
  responseQuestionCreate = requestAdminQuizQuestionCreate(
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
  questionId = responseQuestionCreate.body.questionId
});

describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    // Gets the latest details of the quiz
    const responseQuizDetails = requestGetQuiz(quizId, session);
    // Checks that the response from the function is an quiz object and that the
    // status code returned is 200
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 1,
      questions: [
        {
          question: 'Question',
          questionId: questionId,
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Right',
              colour: expect.any(String),
              correct: true,
              id: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when the session is invalid', () => {
      const responseQuizDetails = requestGetQuiz(quizId, session + 'Invalid Session');
      // Checks that an unauthorised call to fetch quiz detail returns an error object
      // and a status code of 401
      expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizDetails.statusCode).toStrictEqual(UNAUTHORISED);
    });

    test('Testing when the session is valid but the quizId is not', () => {
      const responseQuizDetails = requestGetQuiz(quizId + quizIdOffset, session);
      // Checks that the non-existant quiz returns an error object and a status code 
      // of 403
      expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizDetails.statusCode).toStrictEqual(FORBIDDEN);
    });
  });

  test('Testing GET /v1/admin/quiz/{quizid} works as intended', () => {
    let responseQuizDetails = requestGetQuiz(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'Description',
      numQuestions: 1,
      questions: [
        {
          question: 'Question',
          questionId: questionId,
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Right',
              colour: expect.any(String),
              correct: true,
              id: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);

    // Creates a second quiz and gets the second quiz's id
    responseQuestionCreate = requestAdminQuizQuestionCreate(
      quizId,
      session,
      {
        questionBody: {
          question: 'Question2',
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
    const questionId2 = responseQuestionCreate.body.questionId;

    // Update the quiz's name
    requestAdminQuizUpdateName(
      quizId,
      session,
      'New Name'
    );
    // Update the quiz's description
    requestAdminQuizUpdateDescription(
      quizId,
      session,
      'New Description'
    );

    // Updates the first question in the quiz
    requestAdminQuizQuestionUpdate(
      quizId,
      questionId,
      session,
      {
        questionBody: {
          question: 'Question1',
          timeLimit: 45,
          points: 6,
          answerOptions: [
            {
              answer: 'Changed Right',
              correct: true
            },
            {
              answer: 'Wrong',
              correct: false
            },
            {
              answer: 'Extra',
              correct: false
            }
          ]
        }
      }
    );

    // Overites the response of quiz detail to latest
    responseQuizDetails = requestGetQuiz(quizId, session);
    // Checks that the response can get the latest quiz details after update
    // and that the status code is 200
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'New Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'New Description',
      numQuestions: 2,
      questions: [
        {
          question: 'Question1',
          questionId: questionId,
          timeLimit: 45,
          points: 6,
          answerOptions: [
            {
              answer: 'Changed Right',
              colour: expect.any(String),
              correct: true,
              id: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            },
            {
              answer: 'Extra',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            },
          ]
        },
        {
          question: 'Question2',
          questionId: questionId2,
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Right',
              colour: expect.any(String),
              correct: true,
              id: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              id: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
    
    // Deletes all the questions
    requestDeleteQuizQuestion(quizId, questionId, session);
    requestDeleteQuizQuestion(quizId, questionId2, session);

    responseQuizDetails = requestGetQuiz(quizId, session);
    // Checks that the quiz detail can't get the deleted questions
    // and returns it still returns an quiz object and a status code of 200
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'New Name',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'New Description',
      numQuestions: 0,
      questions: [],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
    
    // Deletes the quiz
    requestDeleteQuiz(quizId, session);

    responseQuizDetails = requestGetQuiz(quizId, session);
    // Checks that deleted quiz's details is unavailable and returns an error object and
    // a status code of 403
    expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizDetails.statusCode).toStrictEqual(FORBIDDEN);
  });
});
