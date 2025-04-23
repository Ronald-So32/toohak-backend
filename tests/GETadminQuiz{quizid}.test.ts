import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestDeleteQuiz,
  requestAdminQuizQuestionCreate,
  requestGetQuiz,
  requestAdminQuizUpdateName,
  requestAdminQuizUpdateDescription,
  requestAdminQuizQuestionUpdate,
  requestDeleteQuizQuestion
} from './testsHelper';

import {
  idOffset,
  ErrorCodes
} from '../src/functionsHelper';

import { describe } from 'node:test';

// Define variables to store response objects, session token, and IDs
let responseRegister: responseInterface;
let responseCreate: responseInterface;
let responseQuestionCreate: responseInterface;
let session: string;
let quizId: number;
let questionId: number;

// Before each test clears the data then registers a user, creating a quiz
// with a question, obtaining the current session, the quizId and the questionId
beforeEach(() => {
  // Reset the application state before each test
  requestClear();
  
  // Register a new admin user and extract the session token
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  
  // Create a quiz for the logged-in user and extract the quiz ID
  responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseCreate.body.quizId;
  
  // Create a question for the quiz and extract the question ID
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
  questionId = responseQuestionCreate.body.questionId;
});

describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  test('Testing the code 200 return value', () => {
    // Gets the latest details of the quiz
    const responseQuizDetails = requestGetQuiz(quizId, session);
    
    // Checks that the response from the function is a quiz object and that the
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
              answerId: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              answerId: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing status code of 401 return values', () => {
      // Test multiple unauthorized scenarios using parametrized tests
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
        // Attempt to get quiz details with invalid session credentials
        const responseQuizDetails = requestGetQuiz(quizId, session + 'Invalid Session');
        
        // Checks that an unauthorised call to fetch quiz detail returns an error object
        // and a status code of 401
        expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    test('Testing when the session is valid but the quizId is not', () => {
      // Attempt to get details for a non-existent quiz
      const responseQuizDetails = requestGetQuiz(quizId + idOffset, session);
      
      // Checks that the non-existent quiz returns an error object and a status code
      // of 403
      expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });
  });

  test('Testing GET /v1/admin/quiz/{quizid} works as intended', () => {
    // Verify initial quiz state
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
              answerId: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              answerId: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.OK);

    // Creates a second question for the quiz and gets its ID
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

    // Overwrites the response of quiz detail to latest
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
              answerId: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              answerId: expect.any(Number)
            },
            {
              answer: 'Extra',
              colour: expect.any(String),
              correct: false,
              answerId: expect.any(Number)
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
              answerId: expect.any(Number)
            },
            {
              answer: 'Wrong',
              colour: expect.any(String),
              correct: false,
              answerId: expect.any(Number)
            }
          ]
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.OK);

    // Deletes all the questions
    requestDeleteQuizQuestion(quizId, questionId, session);
    requestDeleteQuizQuestion(quizId, questionId2, session);

    // Get quiz details after deleting all questions
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
    expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.OK);

    // Deletes the quiz
    requestDeleteQuiz(quizId, session);

    // Attempt to get details of the deleted quiz
    responseQuizDetails = requestGetQuiz(quizId, session);
    
    // Checks that deleted quiz's details is unavailable and returns an error object and
    // a status code of 403
    expect(responseQuizDetails.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
  });
});