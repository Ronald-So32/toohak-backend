
import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionUpdate,
  requestAdminAuthLogout
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
let session2: string;
let quizId: number;
let quizId2: number;
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

describe('Test invalid cases', () => {
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
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
        const response = requestAdminQuizQuestionUpdate(quizId, questionId, session, updateQuestionBody);
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
          questionId,
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
    test('Logged out session', () => {
      requestAdminAuthLogout(session);
      const response = requestAdminQuizQuestionUpdate(
        quizId,
        questionId,
        session,
        {
          "questionBody": {
            "question": "Question",
            "timeLimit": 20,
            "points": 5,
            "answerOptions": [
              { "answer": "Right", "correct": true },
              { "answer": "Wrong", "correct": false }
            ]
          }
        }
      );
      expect(response.body).toStrictEqual({ error: expect.any(String) });
      expect(response.statusCode).toStrictEqual(UNAUTHORISED);
    });
    
    test('Invalid user session', () => {
      requestAdminAuthLogout(session);
      const response = requestAdminQuizQuestionUpdate(
        quizId,
        questionId, 
        session + 'Invalid Session',
        {
          "questionBody": {
            "question": "Question",
            "timeLimit": 20,
            "points": 5,
            "answerOptions": [
              { "answer": "Right", "correct": true },
              { "answer": "Wrong", "correct": false }
            ]
          }
        }
      );
      expect(response.body).toStrictEqual({ error: expect.any(String) });
      expect(response.statusCode).toStrictEqual(UNAUTHORISED);
    });
  });
  
  describe('Test cases for error 403', () => {
    test('Test case for Valid session is provided, but user is not an owner of this quiz', () => {
      responseRegister = requestAdminAuthRegister(
        'z7277272@ad.unsw.edu.au',
        'Password1',
        'First',
        'Last'
      );
      session2 = responseRegister.body.session;
  
      const responseQuizCreate = requestAdminQuizCreate(
        session,
        'Quiz Name',
        'Description'
      );
      quizId2 = responseQuizCreate.body.quizId;
    
      responseQuestionCreate = requestAdminQuizQuestionCreate(
        quizId,
        questionId,
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
      questionId2 = responseQuestionCreate.body.questionId;
      
      const response = requestAdminQuizQuestionUpdate(
        quizId2,
        questionId,
        session,
        {
          "questionBody": {
            "question": "Question",
            "timeLimit": 20,
            "points": 5,
            "answerOptions": [
              { "answer": "Right", "correct": true },
              { "answer": "Wrong", "correct": false }
            ]
          }
        }
      );
      expect(response.body).toStrictEqual({ error: expect.any(String) });
      expect(response.statusCode).toStrictEqual(FORBIDDEN);
    });
  
    test('Quiz does not exist', () => {
      const response = requestAdminQuizQuestionUpdate(
        quizId + quizIdOffset,
        questionId,
        session,
        {
          "questionBody": {
            "question": "Question",
            "timeLimit": 20,
            "points": 5,
            "answerOptions": [
              { "answer": "Right", "correct": true },
              { "answer": "Wrong", "correct": false }
            ]
          }
        }
      );
      expect(response.body).toStrictEqual({ error: expect.any(String) });
      expect(response.statusCode).toStrictEqual(FORBIDDEN);
    });
  });
});

describe('Test valid cases', () => {
  test('Testing correct return value', () => {
    const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
      quizId,
      questionId,
      session,
      {
        "questionBody": {
          "question": "Question",
          // change timeLimit to 9
          "timeLimit": 9,
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
    expect(responseQuestionUpdate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
  });

  describe('Valid question strings', () => {
    test.each([
      {
        question: "Quest",
        description: "Containing exactly 5 characters"
      },
      {
        question: "Quest".repeat(10),
        description: "Containing exactly 50 characters"
      },
      {
        question: "Ab1!@#$%^&*()_+-= []{}\\|'\";:?/.,<>`~",
        description: "Containing different types of chacters"
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
      expect(responseQuestionUpdate.body).toStrictEqual({ questionId: expect.any(Number) });
      expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
    });
  });

  describe('Valid answers', () => {
    test.each([
      {
        answerOptions: [
          {
            "answer": "Right",
            "correct": true
          },
          {
            "answer": "Wrong",
            "correct": false
          }
        ],
        description: "Containing exactly 2 answers"
      },
      {
        answerOptions: [
          {
            "answer": "Right",
            "correct": true
          },
          {
            "answer": "Wrong1",
            "correct": false
          },
          {
            "answer": "Wrong2",
            "correct": false
          },
          {
            "answer": "Wrong3",
            "correct": false
          },
          {
            "answer": "Wrong4",
            "correct": false
          },
          {
            "answer": "Wrong5",
            "correct": false
          },
        ],
        description: "Containing exactly 6 answers"
      },
      {
        answerOptions: [
          {
            "answer": "R",
            "correct": true
          },
          {
            "answer": "Wrong",
            "correct": false
          }
        ],
        description: "Answer containing exactly 1 character"
      },
      {
        answerOptions: [
          {
            "answer": "Right".repeat(6),
            "correct": true
          },
          {
            "answer": "Wrong",
            "correct": false
          }
        ],
        description: "Answer containing exactly 30 character"
      },
    ])('$description', ({ answerOptions }) => {
      const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
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
      expect(responseQuestionUpdate.body).toStrictEqual({ questionId: expect.any(Number) });
      expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
    });
  });

  test('Sum of question timeLimits in quiz is exactly 3 minutes', () => {
    const questionBody = {
      "questionBody": {
        "question": "Question",
        "timeLimit": 59,
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
    };
    responseQuestionCreate = requestAdminQuizQuestionCreate(quizId, session, questionBody);
    questionId = responseQuestionCreate.body.questionId;

    responseQuestionCreate = requestAdminQuizQuestionCreate(quizId, session, questionBody);
    questionId2 = responseQuestionCreate.body.questionId;
    
    responseQuestionCreate = requestAdminQuizQuestionCreate(quizId, session, questionBody);
    questionId3 = responseQuestionCreate.body.questionId;

    // summed with other two question bodies, time limit equal 3 min exaclty
    const updateQuestionBody = {
      "questionBody": {
        "question": "Question",
        "timeLimit": 62,
        "points": 5,
        "answerOptions": [
          { "answer": "Right", "correct": true },
          { "answer": "Wrong", "correct": false }
        ]
      }
    };
    const responseQuestionUpdate = requestAdminQuizQuestionUpdate(quizId, questionId, session, updateQuestionBody);
    expect(responseQuestionUpdate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);

    describe('Valid timelimit', () => {
      test.each([
        {
          timeLimit: 1,
          description: "Is a positive number"
        },
        {
          timeLimit: 180,
          description: "Timelimit exceeds 3 minutes"
        },
      ])('$desription', ({ timeLimit }) => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
          session,
          {
            "questionBody": {
              "question": "Question",
              timeLimit,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ questionId: expect.any(Number) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
      });
    });

    describe('Valid points awarded', () => {
      test.each([
        {
          points: 1,
          description: "Point awarded is exactly 1"
        },
        {
          points: 10,
          description: "Point awarded is exactly 10"
        },
      ])('$desription', ({ points }) => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
          session,
          {
            "questionBody": {
              "question": "Question",
              "timeLimit": 4,
              points,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ questionId: expect.any(Number) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
      });
    });
  });
});

