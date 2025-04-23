import {
  requestClear,
  requestAdminAuthLogout,
  requestAdminQuizQuestionMove,
  requestAdminQuizQuestionCreate,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestGetQuiz
} from './testsHelper';

import {
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
let questionId: number;
let questionId2: number;
let questionId3: number;
let timeCreated: number;
let timeEdited: number;

// Before each test clears the data then registers a user and gets the current
// session then creates a quiz with 3 questions and gets the quiz id and question ids
beforeEach(() => {
  requestClear();
  const responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  const responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;
  const responseQuestion = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Who is the Monarch of England?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Prince Charles',
            correct: true
          },
          {
            answer: 'Queen Elizebeth',
            correct: false
          }
        ]
      }
    }
  );
  questionId = responseQuestion.body.questionId;
  const responseQuestion2 = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Yeasdfs?',
        timeLimit: 7,
        points: 10,
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
  questionId2 = responseQuestion2.body.questionId;
  const responseQuestion3 = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Nasdfo?',
        timeLimit: 6,
        points: 7,
        answerOptions: [
          {
            answer: 'True',
            correct: true
          },
          {
            answer: 'False',
            correct: false
          }
        ]
      }
    }
  );
  timeEdited = Math.floor(Date.now() / 1000);
  questionId3 = responseQuestion3.body.questionId;
});

describe('Testing PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      // Moves the question and gets the response
      const responseMove = requestAdminQuizQuestionMove(
        quizId,
        questionId,
        session,
        1
      );
      // Checks that a valid call to move question returns an empty object
      // and a status code of 200
      expect(responseMove.body).toStrictEqual({});
      expect(responseMove.statusCode).toStrictEqual(ErrorCodes.OK);
    });
  });

  describe('Test error cases', () => {
    test('Invalid session', () => {
      const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
        quizId,
        questionId,
        session + 'Invalid Session',
        1
      );
      // Checks that an unauthorised call to move question returns an error object and a
      // status code of 401
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
    });

    test('Session logged out', () => {
      requestAdminAuthLogout(session);
      const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
        quizId,
        questionId,
        session,
        1
      );
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
    });

    test('Session has no quizzes', () => {
      // New session with no quizzes
      const responseRegister2 = requestAdminAuthRegister(
        'z72696969@ad.unsw.edu.au',
        'Password1',
        'First',
        'Last'
      );
      const session2 = responseRegister2.body.session;
      const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
        quizId,
        questionId,
        session2,
        1
      );
      // Checks that a forbidden call to move question returns an error object and a
      // status code of 401
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });

    test('Quiz does not exist', () => {
      const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
        quizId + idOffset,
        questionId,
        session,
        1
      );
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });

    describe('Error response 400 test cases', () => {
      test('Question does not exist', () => {
        const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
          quizId,
          questionId + idOffset,
          session,
          1
        );
        expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
        expect(responseMoveQuizQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
      });
      
      describe('Invalid NewPosition', () => {
        test.each([
          {
            description: 'NewPosition is less than 0',
            newPosition: -2
          },
          {
            description: 'NewPosition is greater than n-1 where n is the number of questions',
            newPosition: 6
          },
          {
            description: 'NewPosition is the same as current one',
            newPosition: 0
          }
        ])('$description', ({ newPosition }) => {
          const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
            quizId,
            questionId,
            session,
            newPosition
          );
          expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
          expect(responseMoveQuizQuestion.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });
    });
  });

  test('Testing PUT /v1/admin/quiz/{quizid}/question/{questionid}/move works as intended', () => {
    // Gets the latest details of the quiz
    let responseQuizGet = requestGetQuiz(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({
      description: 'Description',
      name: 'Name',
      numQuestions: 3,
      questions: [
        {
          answerOptions: [
            {
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
              answerId: 1,
            },
            {
              answer: 'Queen Elizebeth',
              colour: expect.any(String),
              correct: false,
              answerId: 2,
            },
          ],
          points: 5,
          question: 'Who is the Monarch of England?',
          questionId: expect.any(Number),
          timeLimit: 4,
        },
        {
          question: 'Yeasdfs?',
          questionId: expect.any(Number),
          timeLimit: 7,
          points: 10,
          answerOptions: [
            {
              colour: expect.any(String),
              answerId: 1,
              answer: 'Right',
              correct: true
            },
            {
              colour: expect.any(String),
              answerId: 2,
              answer: 'Wrong',
              correct: false
            }
          ]
        },
        {
          question: 'Nasdfo?',
          questionId: expect.any(Number),
          timeLimit: 6,
          points: 7,
          answerOptions: [
            {
              colour: expect.any(String),
              answerId: 1,
              answer: 'True',
              correct: true
            },
            {
              colour: expect.any(String),
              answerId: 2,
              answer: 'False',
              correct: false
            }
          ]
        }
      ],
      quizId: 2,
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      timeLimit: 17,
    });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);

    // Move 1 to 2 (0 2 1)
    let responseMove = requestAdminQuizQuestionMove(
      quizId,
      questionId2,
      session,
      2
    );
    timeEdited = Math.floor(Date.now() / 1000);
    expect(responseMove.body).toStrictEqual({});
    expect(responseMove.statusCode).toStrictEqual(ErrorCodes.OK);

    // Check again
    responseQuizGet = requestGetQuiz(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({
      description: 'Description',
      name: 'Name',
      numQuestions: 3,
      questions: [
        {
          answerOptions: [
            {
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
              answerId: 1,
            },
            {
              answer: 'Queen Elizebeth',
              colour: expect.any(String),
              correct: false,
              answerId: 2,
            },
          ],
          points: 5,
          question: 'Who is the Monarch of England?',
          questionId: expect.any(Number),
          timeLimit: 4,
        },
        {
          question: 'Nasdfo?',
          questionId: expect.any(Number),
          timeLimit: 6,
          points: 7,
          answerOptions: [
            {
              colour: expect.any(String),
              answerId: 1,
              answer: 'True',
              correct: true
            },
            {
              colour: expect.any(String),
              answerId: 2,
              answer: 'False',
              correct: false
            }
          ]
        },
        {
          question: 'Yeasdfs?',
          questionId: expect.any(Number),
          timeLimit: 7,
          points: 10,
          answerOptions: [
            {
              colour: expect.any(String),
              answerId: 1,
              answer: 'Right',
              correct: true
            },
            {
              colour: expect.any(String),
              answerId: 2,
              answer: 'Wrong',
              correct: false
            }
          ]
        },
      ],
      quizId: 2,
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      timeLimit: 17,
    });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);

    // Move 2 to 0 (2 0 1)
    responseMove = requestAdminQuizQuestionMove(
      quizId,
      questionId3,
      session,
      0
    );
    timeEdited = Math.floor(Date.now() / 1000);
    expect(responseMove.body).toStrictEqual({});
    expect(responseMove.statusCode).toStrictEqual(ErrorCodes.OK);

    // Check again
    responseQuizGet = requestGetQuiz(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({
      description: 'Description',
      name: 'Name',
      numQuestions: 3,
      questions: [
        {
          question: 'Nasdfo?',
          questionId: expect.any(Number),
          timeLimit: 6,
          points: 7,
          answerOptions: [
            {
              colour: expect.any(String),
              answerId: 1,
              answer: 'True',
              correct: true
            },
            {
              colour: expect.any(String),
              answerId: 2,
              answer: 'False',
              correct: false
            }
          ]
        },
        {
          answerOptions: [
            {
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
              answerId: 1,
            },
            {
              answer: 'Queen Elizebeth',
              colour: expect.any(String),
              correct: false,
              answerId: 2,
            },
          ],
          points: 5,
          question: 'Who is the Monarch of England?',
          questionId: expect.any(Number),
          timeLimit: 4,
        },
        {
          question: 'Yeasdfs?',
          questionId: expect.any(Number),
          timeLimit: 7,
          points: 10,
          answerOptions: [
            {
              colour: expect.any(String),
              answerId: 1,
              answer: 'Right',
              correct: true
            },
            {
              colour: expect.any(String),
              answerId: 2,
              answer: 'Wrong',
              correct: false
            }
          ]
        },
      ],
      quizId: 2,
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      timeLimit: 17,
    });
    expect(responseQuizGet.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});
