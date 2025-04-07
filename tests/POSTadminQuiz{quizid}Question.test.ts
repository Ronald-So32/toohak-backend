import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;

let session: string;
let quizId: number;
let timeCreated: number;

// Before each test clears the data, then registers a user and gets
// the current session, then creates a quiz and gets the quiz id and
// time created
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
});

describe('Testing POST /v1/admin/quiz', () => {
  test('Testing the return value', () => {
    // Creates a question in the quiz and gets it's response
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
    // Checks that a valid call to create question returns a questionId object
    // and a status code 200
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing invalid session', () => {
      const responseQuestionCreate = requestAdminQuizQuestionCreate(
        quizId,
        session + 'Invalid Session',
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
      // Checks that an unauthorised call to create question returns an error object and
      // a status code of 401
      expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionCreate.statusCode).toStrictEqual(UNAUTHORISED);
    });

    describe('Testing the 403 errors', () => {
      test('Quiz not owned by user', () => {
        const responseRegister = requestAdminAuthRegister(
          'z5277272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        );
        session = responseRegister.body.session;

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
        // Checks that a forbidden call to create question returns an error object and
        // a status code of 403
        expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionCreate.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Quiz does not exist', () => {
        const responseQuestionCreate = requestAdminQuizQuestionCreate(
          quizId + quizIdOffset,
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
        expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionCreate.statusCode).toStrictEqual(FORBIDDEN);
      });
    });

    describe('Testing the question string', () => {
      describe('Invalid question strings', () => {
        test.each([
          {
            question: 'Ques',
            description: 'Containing less than 5 characters'
          },
          {
            question: 'Quest'.repeat(11),
            description: 'Containing more than 50 characters'
          },
          {
            question: '',
            description: 'Empty string'
          }
        ])('$description', ({ question }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            {
              questionBody: {
                question: question,
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
          // Checks that an invalid call to create question returns an error object and
          // a status code of 400
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        });
      });

      describe('Valid question strings', () => {
        test.each([
          {
            question: 'Quest',
            description: 'Containing exactly 5 characters'
          },
          {
            question: 'Quest'.repeat(10),
            description: 'Containing exactly 50 characters'
          },
          {
            question: "Ab1!@#$%^&*()_+-= []{}\\|'\";:?/.,<>`~",
            description: 'Containing different types of chacters'
          }
        ])('$description', ({ question }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            {
              questionBody: {
                question: question,
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
                answer: 'Right',
                correct: true
              }
            ],
            description: 'Containing less than 2 answers'
          },
          {
            answerOptions: [
              {
                answer: 'Right',
                correct: true
              },
              {
                answer: 'Wrong1',
                correct: false
              },
              {
                answer: 'Wrong2',
                correct: false
              },
              {
                answer: 'Wrong3',
                correct: false
              },
              {
                answer: 'Wrong4',
                correct: false
              },
              {
                answer: 'Wrong5',
                correct: false
              },
              {
                answer: 'Wrong6',
                correct: false
              }
            ],
            description: 'Containing more than 6 answers'
          },
          {
            answerOptions: [
              {
                answer: 'Right',
                correct: true
              },
              {
                answer: 'Right',
                correct: true
              },
              {
                answer: 'Wrong',
                correct: false
              }
            ],
            description: 'Duplicate answer strings within same questions'
          },
          {
            answerOptions: [
              {
                answer: 'Right',
                correct: false
              },
              {
                answer: 'Wrong',
                correct: false
              }
            ],
            description: 'No correct answers'
          },
          {
            answerOptions: [
              {
                answer: '',
                correct: true
              },
              {
                answer: 'Wrong',
                correct: false
              }
            ],
            description: 'Answer containing less than 1 character'
          },
          {
            answerOptions: [
              {
                answer: 'Right'.repeat(7),
                correct: true
              },
              {
                answer: 'Wrong',
                correct: false
              }
            ],
            description: 'Answer containing more than 30 character'
          }
        ])('$description', ({ answerOptions }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            {
              questionBody: {
                question: 'Question',
                timeLimit: 4,
                points: 5,
                answerOptions
              }
            }
          );
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        });
      });

      describe('Valid answers', () => {
        test.each([
          {
            answerOptions: [
              {
                answer: 'Right',
                correct: true
              },
              {
                answer: 'Wrong',
                correct: false
              }
            ],
            description: 'Containing exactly 2 answers'
          },
          {
            answerOptions: [
              {
                answer: 'Right',
                correct: true
              },
              {
                answer: 'Wrong1',
                correct: false
              },
              {
                answer: 'Wrong2',
                correct: false
              },
              {
                answer: 'Wrong3',
                correct: false
              },
              {
                answer: 'Wrong4',
                correct: false
              },
              {
                answer: 'Wrong5',
                correct: false
              },
            ],
            description: 'Containing exactly 6 answers'
          },
          {
            answerOptions: [
              {
                answer: 'R',
                correct: true
              },
              {
                answer: 'Wrong',
                correct: false
              }
            ],
            description: 'Answer containing exactly 1 character'
          },
          {
            answerOptions: [
              {
                answer: 'Right'.repeat(6),
                correct: true
              },
              {
                answer: 'Wrong',
                correct: false
              }
            ],
            description: 'Answer containing exactly 30 character'
          },
        ])('$description', ({ answerOptions }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            {
              questionBody: {
                question: 'Question',
                timeLimit: 4,
                points: 5,
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
            description: 'Not a positive number'
          },
          {
            timeLimit: 0,
            description: 'Neither a positive or a negative number'
          },
          {
            timeLimit: 181,
            description: 'Timelimit exceeds 3 minutes'
          },
        ])('$desription', ({ timeLimit }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            {
              questionBody: {
                question: 'Question',
                timeLimit,
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
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        });

        test('Sum of question timeLimits in quiz exceeds 3 minutes', () => {
          const questionBody = {
            questionBody: {
              question: 'Question',
              timeLimit: 61,
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
            questionBody: {
              question: 'Question',
              timeLimit: 60,
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
              description: 'Is a positive number'
            },
            {
              timeLimit: 180,
              description: 'Timelimit exceeds 3 minutes'
            },
          ])('$desription', ({ timeLimit }) => {
            const responseQuestionCreate = requestAdminQuizQuestionCreate(
              quizId,
              session,
              {
                questionBody: {
                  question: 'Question',
                  timeLimit,
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
            description: 'Not a positive number'
          },
          {
            points: 0,
            description: 'Neither a positive or a negative number'
          },
          {
            points: 11,
            description: 'Points awarded is greater then 10'
          },
        ])('$desription', ({ points }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            {
              questionBody: {
                question: 'Question',
                timeLimit: 4,
                points,
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
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
        });
      });

      describe('Invalid points awarded', () => {
        test.each([
          {
            points: 1,
            description: 'Point awarded is exactly 1'
          },
          {
            points: 10,
            description: 'Point awarded is exactly 10'
          },
        ])('$desription', ({ points }) => {
          const responseQuestionCreate = requestAdminQuizQuestionCreate(
            quizId,
            session,
            {
              questionBody: {
                question: 'Question',
                timeLimit: 4,
                points,
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
          expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
        });
      });
    });
  });

  test('Testing POST /v1/admin/quiz/{quizid}/question works as intended', () => {
    // Creates one question and gets it's question id
    let responseQuestionCreate = requestAdminQuizQuestionCreate(
      quizId,
      session,
      {
        questionBody: {
          question: 'Question1',
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
    const question1Id = responseQuestionCreate.body.questionId;
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);

    // Creates another question and gets it's id and time question was created
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
            },
            {
              answer: 'Maybe',
              correct: false
            }
          ]
        }
      }
    );
    const timeLastEdited1 = Math.floor(Date.now() / 1000);
    const question2Id = responseQuestionCreate.body.questionId;
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);

    // Creates a second quiz and gets it's id and time created
    const responseQuizCreate2 = requestAdminQuizCreate(
      session,
      'Quiz Name2',
      'Description2'
    );
    const timeCreated2 = Math.floor(Date.now() / 1000);
    const quizId2 = responseQuizCreate2.body.quizId;

    // Creates a question in the second quiz and gets it's id and time created
    responseQuestionCreate = requestAdminQuizQuestionCreate(
      quizId2,
      session,
      {
        questionBody: {
          question: 'Question3',
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
            },
            {
              answer: 'Maybe',
              correct: false
            }
          ]
        }
      }
    );
    const timeLastEdited2 = Math.floor(Date.now() / 1000);
    const question3Id = responseQuestionCreate.body.questionId;
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);

    // Check that the first quiz has the right details and that the time edited is when
    // the latest question was made in the quiz
    let responseQuizDetails = requestGetQuiz(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'Quiz Name',
      timeCreated: timeCreated,
      timeLastEdited: timeLastEdited1,
      description: 'Description',
      numQuestions: 2,
      questions: [
        {
          question: 'Question1',
          questionId: question1Id,
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
        },
        {
          question: 'Question2',
          questionId: question2Id,
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
            },
            {
              answer: 'Maybe',
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

    // Checks again for the second quiz
    responseQuizDetails = requestGetQuiz(quizId2, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId2,
      name: 'Quiz Name2',
      timeCreated: timeCreated2,
      timeLastEdited: timeLastEdited2,
      description: 'Description2',
      numQuestions: 1,
      questions: [
        {
          question: 'Question3',
          questionId: question3Id,
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
            },
            {
              answer: 'Maybe',
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
});
