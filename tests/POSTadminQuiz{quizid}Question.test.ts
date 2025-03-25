import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
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
let quizId: number;
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

  const responseQuizCreate = requestAdminQuizCreate(
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
            },
            {
              "answer": "Wrong",
              "correct": false
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
              },
              {
                "answer": "Wrong",
                "correct": false
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
                },
                {
                  "answer": "Wrong",
                  "correct": false
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
                },
                {
                  "answer": "Wrong",
                  "correct": false
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
        ])('$description', ({ question }) => {
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
                },
                {
                  "answer": "Wrong",
                  "correct": false
                }
              ]
            }
          }
          );
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        })
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
        ])('$description', ({ question }) => {
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
                },
                {
                  "answer": "Wrong",
                  "correct": false
                }
              ]
            }
          }
          );
          expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
        });
      });
    });

    describe('Testing the answers', () => {
      describe('Invalid answers', () => {
        test.each([
          {
            answerOptions: [
              {
                "answer": "Right",
                "correct": true
              }
            ],
            description: "Containing less than 2 answers"
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
              {
                "answer": "Wrong6",
                "correct": false
              }
            ],
            description: "Containing more than 6 answers"
          },
          {
            answerOptions: [
              {
                "answer": "Right",
                "correct": true
              },
              {
                "answer": "Right",
                "correct": true
              },
              {
                "answer": "Wrong",
                "correct": false
              }
            ],
            description: "Duplicate answer strings within same questions"
          },
          {
            answerOptions: [
              {
                "answer": "Right",
                "correct": false
              },
              {
                "answer": "Wrong",
                "correct": false
              }
            ],
            description: "No correct answers"
          },
          {
            answerOptions: [
              {
                "answer": "",
                "correct": true
              },
              {
                "answer": "Wrong",
                "correct": false
              }
            ],
            description: "Answer containing less than 1 character"
          },
          {
            answerOptions: [
              {
                "answer": "Right".repeat(7),
                "correct": true
              },
              {
                "answer": "Wrong",
                "correct": false
              }
            ],
            description: "Answer containing more than 30 character"
          }
        ])('$description', ({ answerOptions }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
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
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        })
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
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
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
          expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
        });

      });

  
    });

    describe('Testing the timelimit', () => {
      describe('Invalid timelimit', () => {
        test.each([
          {
            timeLimit: -1,
            description: "Not a positive number"
          },
          {
            timeLimit: 0,
            description: "Neither a positive or a negative number"
          },
          {
            timeLimit: 181,
            description: "Timelimit exceeds 3 minutes"
          },
        ])('$desription', ({ timeLimit }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
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
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        });

        test('Sum of question timeLimits in quiz exceeds 3 minutes', () => {
          const questionBody = {
            "questionBody": {
              "question": "Question",
              "timeLimit": 61,
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
          requestAdminQuizQuestionCreate(
            quizId,
            session,
            questionBody
          );
          requestAdminQuizQuestionCreate(
            quizId,
            session,
            questionBody
          );
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            questionBody
          );
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        });

        test('Sum of question timeLimits in quiz is exactly 3 minutes', () => {
          const questionBody = {
            "questionBody": {
              "question": "Question",
              "timeLimit": 60,
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
          requestAdminQuizQuestionCreate(
            quizId,
            session,
            questionBody
          );
          requestAdminQuizQuestionCreate(
            quizId,
            session,
            questionBody
          );
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            questionBody
          );
          expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
        });

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
            const responseQuestionCreate = requestAdminQuizQuestionCreate(
              quizId,
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
            expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
            expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
          });
        });
      });
      
    });

    describe('Testing the points awarded', () => {
      describe('Invalid points awarded', () => {
        test.each([
          {
            points: -1,
            description: "Not a positive number"
          },
          {
            points: 0,
            description: "Neither a positive or a negative number"
          },
          {
            points: 11,
            description: "Points awarded is greater then 10"
          },
        ])('$desription', ({ points }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
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
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        });
      });

      describe('Invalid points awarded', () => {
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
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
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
          expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
        });
      });
    });
  });
  
  test('Testing POST /v1/admin/quiz/{quizid}/question works as intended', () => {
    let responseQuestionCreate = requestAdminQuizQuestionCreate(
      quizId,
      session,
      {
        "questionBody": {
          "question": "Question1",
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
    requestAdminQuizQuestionCreate(
      quizId,
      session,
      {
        "questionBody": {
          "question": "Question2",
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
            },
            {
              "answer": "Maybe",
              "correct": false
            }
          ]
        }
      }
    );
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);

    const responseQuizCreate2 = requestAdminQuizCreate(
      session,
      'Quiz Name2',
      'Description2'
    );
    const quizId2 = responseQuizCreate2.body.quizId;

    responseQuestionCreate = requestAdminQuizQuestionCreate(
      quizId2,
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
            },
            {
              "answer": "Maybe",
              "correct": false
            }
          ]
        }
      }
    );
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);

    /*
    const responseQuizDetails = requestGetQuiz(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      "quizId": quizId,
      "name": "Quiz Name",
      "timeCreated": expect.any(Number),
      "timeLastEdited": expect.any(Number),
      "description": "Description",
      "numQuestions": 0,
      "questions": [
        {
          "question": "Question1",
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
        },
        {
        "questionBody": {
          "question": "Question2",
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
            },
            {
              "answer": "Maybe",
              "correct": false
            }
          ]
        }
      ],
      "timeLimit": expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
  */
  });

});
