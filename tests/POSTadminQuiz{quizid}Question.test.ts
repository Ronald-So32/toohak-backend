import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate
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
let responseQuizCreate: responseInterface;

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

  const responseQuizCreate = requestAdminQuizQuestionCreate(
    session,
    'Quiz Name',
    'Description'
  );
  quizId = responseQuizCreate.body.quizId;

});

describe('Testing POST /v1/admin/quiz', () => {
  test('Testing the return value', () => {
    const responseQuestionCreate = requestAdminQuizQuestionCreate(
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
            }
          ]
        }
      }
    );
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing the return value', () => {
      const responseQuestionCreate = requestAdminQuizQuestionCreate(
        quizId,
        session + 'Invalid Session',
        {
          "questionBody": {
            "question": "Question",
            "timeLimit": 4,
            "points": 5,
            "answerOptions": [
              {
                "answer": "Right",
                "correct": true
              }
            ]
          }
        }
      );
      expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionCreate.statusCode).toStrictEqual(UNAUTHORISED);
    });

    describe('Testing the 403 errors', () => {
      test('Quiz not owned by user', () => {
        responseRegister = requestAdminAuthRegister(
          'z5277272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        );
        session = responseRegister.body.session;
        
        requestAdminAuthLogin('z5277272@ad.unsw.edu.au','Password1');

        const responseQuestionCreate = requestAdminQuizQuestionCreate(
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
                }
              ]
            }
          }
        );
        expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionCreate.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Quiz does not exist', () => {
        const responseQuestionCreate = requestAdminQuizQuestionCreate(
          quizId + quizIdOffset,
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
                }
              ]
            }
          }
        );
        expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionCreate.statusCode).toStrictEqual(FORBIDDEN);
      });
    })

    describe('Testing the question string', () => {
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
        ])
      })('$description', ({ question }) => {
        const responseQuestionCreate = requestAdminQuizQuestionCreate(
          quizId,
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
                }
              ]
            }
          }
        );
        expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
      })

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
        ])
      })('$description', ({ question }) => {
        const responseQuestionCreate = requestAdminQuizQuestionCreate(
          quizId,
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
                }
              ]
            }
          }
        );
        expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
      expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
      })
    });

    describe('Testing the answers', () => {
    
    });

    describe('Testing the timelimit', () => {
    
    });

    describe('Testing the points awarded', () => {
    
    });

  })

});
