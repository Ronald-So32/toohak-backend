import {
  requestClear,
  responseInterface,
  requestAdminAuthLogout,
  requestAdminQuizQuestionMove,
  requestAdminQuizQuestionCreate,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;
const questionIdOffset = 727;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let responseQuestion: responseInterface;
let responseQuestion2: responseInterface;
let responseQuestion3: responseInterface;
let session: string;
let quizId: number;
let questionId: number;
let questionId2: number;
let questionId3: number;

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
  responseQuestion = requestAdminQuizQuestionCreate(
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
            answer: 'ur mom',
            correct: false
          }
        ]
      }
    }
  );
  questionId = responseQuestion.body.questionId;
  responseQuestion2 = requestAdminQuizQuestionCreate(
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
  responseQuestion3 = requestAdminQuizQuestionCreate(
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
  questionId3 = responseQuestion3.body.questionId;
});

describe('Testing PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      const responseMove = requestAdminQuizQuestionMove(
        quizId,
        questionId,
        session,
        1
      );
      expect(responseMove.body).toStrictEqual({});
      expect(responseMove.statusCode).toStrictEqual(OK);
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
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(UNAUTHORISED);
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
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(UNAUTHORISED);
    });
  
    test('Session has no quizzes', () => {
      // New session with no quizes
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
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(FORBIDDEN);
    });

    test('Quiz does not exist', () => {
      const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
        quizId + quizIdOffset, 
        questionId, 
        session, 
        1,
      );
      expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(responseMoveQuizQuestion.statusCode).toStrictEqual(FORBIDDEN);
    });

    describe('Error response 400 test cases', () => {
      test.each([
        {
          description: 'Question Id does not refer to a valid question within this quiz',
          questionId: questionId + questionIdOffset,
          newPosition: 1
        },
        {
          description: 'NewPosition is less than 0',
          questionId: questionId,
          newPosition: -1
        },
        {
          description: 'NewPosition is greater than n-1 where n is the number of questions',
          questionId: questionId,
          newPosition: 5
        },
        {
          description: ' newPosition is the same as current one',
          questionId: questionId,
          newPosition: 0
        }
      ])('$description', ({ questionId, newPosition }) => {
        const responseMoveQuizQuestion = requestAdminQuizQuestionMove(
          quizId, 
          questionId, 
          session, 
          newPosition
        );
        expect(responseMoveQuizQuestion.body).toStrictEqual({ error: expect.any(String) });
        expect(responseMoveQuizQuestion.statusCode).toStrictEqual(BADREQUEST);
      });
    });
  });

  test('Testing PUT /v1/admin/quiz/{quizid}/question/{questionid}/move works as intended', () => {
    const responseQuizGet = requestGetQuiz(quizId, session);
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
              id: 1,
            },
            {
              answer: 'ur mom',
              colour: expect.any(String),
              correct: false,
              id: 2,
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
              id: 1,
              answer: 'Right',
              correct: true
            },
            {
              colour: expect.any(String),
              id: 2,
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
              id: 1,
              answer: 'True',
              correct: true
            },
            {
              colour: expect.any(String),
              id: 2,
              answer: 'False',
              correct: false
            }
          ]
        }
      ],
      quizId: 2,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      timeLimit: 17,
    });
    expect(responseQuizGet.statusCode).toStrictEqual(OK);

    // Move 1 to 2 (0 2 1)
    const responseMove = requestAdminQuizQuestionMove(
      quizId,
      questionId2,
      session,
      2
    );
    expect(responseMove.body).toStrictEqual({});
    expect(responseMove.statusCode).toStrictEqual(OK);

    // Check again
    const responseQuizGet2 = requestGetQuiz(quizId, session);
    expect(responseQuizGet2.body).toStrictEqual({
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
              id: 1,
            },
            {
              answer: 'ur mom',
              colour: expect.any(String),
              correct: false,
              id: 2,
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
              id: 1,
              answer: 'True',
              correct: true
            },
            {
              colour: expect.any(String),
              id: 2,
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
              id: 1,
              answer: 'Right',
              correct: true
            },
            {
              colour: expect.any(String),
              id: 2,
              answer: 'Wrong',
              correct: false
            }
          ]
        },
      ],
      quizId: 2,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      timeLimit: 17,
    });
    expect(responseQuizGet2.statusCode).toStrictEqual(OK);

    // Move 2 to 0 (2 0 1)
    const responseMove2 = requestAdminQuizQuestionMove(
      quizId,
      questionId3,
      session,
      0
    );
    expect(responseMove2.body).toStrictEqual({});
    expect(responseMove2.statusCode).toStrictEqual(OK);

    // Check again
    const responseQuizGet3 = requestGetQuiz(quizId, session);
    expect(responseQuizGet3.body).toStrictEqual({
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
              id: 1,
              answer: 'True',
              correct: true
            },
            {
              colour: expect.any(String),
              id: 2,
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
              id: 1,
            },
            {
              answer: 'ur mom',
              colour: expect.any(String),
              correct: false,
              id: 2,
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
              id: 1,
              answer: 'Right',
              correct: true
            },
            {
              colour: expect.any(String),
              id: 2,
              answer: 'Wrong',
              correct: false
            }
          ]
        },
      ],
      quizId: 2,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      timeLimit: 17,
    });
    expect(responseQuizGet3.statusCode).toStrictEqual(OK);
  });
});
