import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionUpdate
  // requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
const quizIdOffset = 727;
const questionIdOffset = 999;

let responseRegister: responseInterface;
let session: string;
let quizId: number;
let questionId: number;
let questionId2: number;
let questionId3: number;
let responseQuizCreate: responseInterface;
let responseQuestionCreate: responseInterface;

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  
  requestAdminAuthLogin('z7277272@ad.unsw.edu.au','Password1');

  const responseQuizCreate = requestAdminQuizCreate(
    session,
    'Quiz Name',
    'Description'
  );
  quizId = responseQuizCreate.body.quizId;

  responseQuestionCreate = requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      "questionBody": {
        "question": "Question",
        "timeLimit": 4,
        "points": 5,
        "answerOptions": [
          {
            "answer": "Right",
            "correct": true
          },
          {
            "answer": "Wrong",
            "correct": false
          }
        ]
      }
    }
  );
  questionId = responseQuestionCreate.body.questionId;
  expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
  expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
});

describe('error case 400 examples', () => {
  test('Invalid questionId', () => {
    const invalidQuestionIdRes = requestAdminQuizQuestionUpdate(
      quizId,
      questionId + questionIdOffset,
      session,
      {
        "questionBody": {
          "question": 'Question',
          "timeLimit": 4,
          "points": 5,
          "answerOptions": [
            {
              "answer": "Right",
              "correct": true
            },
            {
              "answer": "Wrong",
              "correct": false
            }
          ]
        }
      }
    );
    expect(invalidQuestionIdRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidQuestionIdRes.statusCode).toStrictEqual(BADREQUEST);
  });

  describe('Invalid question strings', () => {
    test.each([
      {
        question: "Ques",
        description: "Containing less than 5 characters"
      },
      {
        question: "Quest".repeat(11),
        description: "Containing more than 50 characters"
      },
      {
        question: "",
        description: "Empty string"
      }
    ])('$description', ({ question }) => {
    const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
      quizId,
      questionId,
      session,
      {
        "questionBody": {
          "question": question,
          "timeLimit": 4,
          "points": 5,
          "answerOptions": [
            {
              "answer": "Right",
              "correct": true
            },
            {
              "answer": "Wrong",
              "correct": false
            }
          ]
        }
      }
    );
      expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  describe('Invalid answers', () => {
    test.each([
      {
        answerOptions: [{ "answer": "Right", "correct": true }],
        description: "Containing less than 2 answers"
      },
      {
        answerOptions: [
          { "answer": "Right", "correct": true },
          { "answer": "Wrong1", "correct": false },
          { "answer": "Wrong2", "correct": false },
          { "answer": "Wrong3", "correct": false },
          { "answer": "Wrong4", "correct": false },
          { "answer": "Wrong5", "correct": false },
          { "answer": "Wrong6", "correct": false }
        ],
        description: "Containing more than 6 answers"
      },
      {
        answerOptions: [
          { "answer": "Right", "correct": true },
          { "answer": "Right", "correct": true },
          { "answer": "Wrong", "correct": false }
        ],
        description: "Duplicate answer strings within same question"
      },
      {
        answerOptions: [
          { "answer": "Right", "correct": false },
          { "answer": "Wrong", "correct": false }
        ],
        description: "No correct answers"
      },
      {
        answerOptions: [
          { "answer": "", "correct": true },
          { "answer": "Wrong", "correct": false }
        ],
        description: "Answer containing less than 1 character"
      },
      {
        answerOptions: [
          { "answer": "Right".repeat(7), "correct": true },
          { "answer": "Wrong", "correct": false }
        ],
        description: "Answer containing more than 30 characters"
      }
    ])('$description', ({ answerOptions }) => {
      const responseQuestionUpdate = requestAdminQuizQuestionCreate(
        quizId,
        questionId,
        session,
        {
          "questionBody": {
            "question": "Question",
            "timeLimit": 4,
            "points": 5,
            answerOptions
          }
        }
      );
      expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  describe('Invalid timelimit', () => {
    test.each([
      { timeLimit: -1, description: "Not a positive number" },
      { timeLimit: 0, description: "Neither a positive or a negative number" },
      { timeLimit: 181, description: "Timelimit exceeds 3 minutes" },
    ])('$description', ({ timeLimit }) => {
      const responseQuestionUpdate = requestAdminQuizQuestionCreate(
        quizId,
        questionId,
        session,
        {
          "questionBody": {
            "question": "Question",
            timeLimit,
            "points": 5,
            "answerOptions": [
              { "answer": "Right", "correct": true },
              { "answer": "Wrong", "correct": false }
            ]
          }
        }
      );
    expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Sum of question timeLimits in quiz exceeds 3 minutes', () => {
      const questionBody = {
        "questionBody": {
          "question": "Question",
          "timeLimit": 60,
          "points": 5,
          "answerOptions": [
            { "answer": "Right", "correct": true },
            { "answer": "Wrong", "correct": false }
          ]
        }
      };
      responseQuestionCreate = requestAdminQuizQuestionCreate(quizId, session, questionBody);
      questionId = responseQuestionCreate.body.questionId;

      responseQuestionCreate = requestAdminQuizQuestionCreate(quizId, session, questionBody);
      questionId2 = responseQuestionCreate.body.questionId;
      
      responseQuestionCreate = requestAdminQuizQuestionCreate(quizId, session, questionBody);
      questionId3 = responseQuestionCreate.body.questionId;
      // summed with other two question bodies, time limit will exceed 3 min
      const updateQuestionBody = {
        "questionBody": {
          "question": "Question",
          "timeLimit": 61,
          "points": 5,
          "answerOptions": [
            { "answer": "Right", "correct": true },
            { "answer": "Wrong", "correct": false }
          ]
        }
      };
      const response = requestAdminQuizQuestionUpdate(quizId, questionId, updateQuestionBody);
      expect(response.body).toStrictEqual({ error: expect.any(String) });
      expect(response.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  describe('Invalid points awarded', () => {
    test.each([
      { points: -1, description: "Not a positive number" },
      { points: 0, description: "Neither a positive or a negative number" },
      { points: 11, description: "Points awarded is greater than 10" },
    ])('$description', ({ points }) => {
      const response = requestAdminQuizQuestionUpdate(
        quizId,
        session,
        {
          "questionBody": {
            "question": "Question",
            "timeLimit": 4,
            points,
            "answerOptions": [
              { "answer": "Right", "correct": true },
              { "answer": "Wrong", "correct": false }
            ]
          }
        }
      );
      expect(response.body).toStrictEqual({ error: expect.any(String) });
      expect(response.statusCode).toStrictEqual(BADREQUEST);
    });
  });
});

describe('Test cases for error 401', () => {
  
});