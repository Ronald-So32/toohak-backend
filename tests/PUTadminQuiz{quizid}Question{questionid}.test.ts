
import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizQuestionUpdate,
  requestAdminAuthLogout,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
const quizIdOffset = 727;
const questionIdOffset = 999;

let session: string;
let quizId: number;
let questionId: number;
let timeCreated: number;

// Before each test clears the data and registers a user and creates a quiz
// and question and gets the current session, quiz id and quetsion id
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
    // Updates the qusetion and gets the reponse
    const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
      quizId,
      questionId,
      session,
      {
        questionBody: {
          question: 'Question',
          timeLimit: 9,
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
    // Checks that a valid call to update question returns an empty object
    // and a status code of 200
    expect(responseQuestionUpdate.body).toStrictEqual({});
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Test cases for error 401', () => {
      test('Logged out session', () => {
        requestAdminAuthLogout(session);
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
          session,
          {
            questionBody: {
              question: 'Question',
              timeLimit: 20,
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
        // Checks that a unauthorised call to update question returns an error object
        // and a status code of 401
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(UNAUTHORISED);
      });

      test('Invalid user session', () => {
        requestAdminAuthLogout(session);
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
          session + 'Invalid Session',
          {
            questionBody: {
              question: 'Question',
              timeLimit: 20,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(UNAUTHORISED);
      });
    });

    describe('Test cases for error 403', () => {
      test('Invalid questionId', () => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId + questionIdOffset,
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
        // Checks that invalid call to update question returns an error object and
        // a status code of 400
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
      });

      test('Test case for Valid session is provided, but user is not an owner of this quiz', () => {
        requestAdminAuthRegister(
          'z7277272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        );
        const responseQuizCreate = requestAdminQuizCreate(
          session,
          'Quiz Name',
          'Description'
        );

        const quizId2 = responseQuizCreate.body.quizId;

        requestAdminQuizQuestionCreate(
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

        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId2,
          questionId,
          session,
          {
            questionBody: {
              question: 'Question',
              timeLimit: 20,
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
        // Checks that forbidden call to update question returns an error object and
        // a status code of 403
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Quiz does not exist', () => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId + quizIdOffset,
          questionId,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(FORBIDDEN);
      });
    });

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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
      });
    });

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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
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
        expect(responseQuestionUpdate.body).toStrictEqual({});
        expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
      });
    });

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
      ])('$description', ({ timeLimit }) => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
      });

      test('Sum of question timeLimits in quiz exceeds 3 minutes', () => {
        const questionBody = {
          questionBody: {
            question: 'Question',
            timeLimit: 50,
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
        // Creates 3 questions that has a summed timelimit of under 3 minutes
        const responseQuestionCreate = requestAdminQuizQuestionCreate(
          quizId,
          session,
          questionBody
        );
        questionId = responseQuestionCreate.body.questionId;

        requestAdminQuizQuestionCreate(quizId, session, questionBody);
        requestAdminQuizQuestionCreate(quizId, session, questionBody);

        // Update the first question so that the timelimit summed with
        // the other two question will exceed 3 minutes
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
          session,
          {
            questionBody: {
              question: 'Question',
              timeLimit: 99,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
      });
    });

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
      ])('$description', ({ points }) => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
          quizId,
          questionId,
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
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
      });
    });
  });
});

describe('Test valid cases', () => {
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
      const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
        quizId,
        questionId,
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
      expect(responseQuestionUpdate.body).toStrictEqual({});
      expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
    });
  });

  test('Sum of question timeLimits in quiz is exactly 3 minutes', () => {
    const questionBody = {
      questionBody: {
        question: 'Question',
        timeLimit: 59,
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
    // Creates 3 question with summed timelimit of under 3 minute
    const responseQuestionCreate = requestAdminQuizQuestionCreate(quizId, session, questionBody);
    questionId = responseQuestionCreate.body.questionId;

    requestAdminQuizQuestionCreate(quizId, session, questionBody);
    requestAdminQuizQuestionCreate(quizId, session, questionBody);

    // Change timelimit of first question so that the sum with other two
    // question is exactly 3 minutes
    const responseQuestionUpdate = requestAdminQuizQuestionUpdate(quizId,
      questionId,
      session,
      {
        questionBody: {
          question: 'Question',
          timeLimit: 62,
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
    expect(responseQuestionUpdate.body).toStrictEqual({});
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
  });
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
    const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
      quizId,
      questionId,
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
    expect(responseQuestionUpdate.body).toStrictEqual({});
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
  });
});

describe('Valid points awarded', () => {
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
    const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
      quizId,
      questionId,
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
    expect(responseQuestionUpdate.body).toStrictEqual({});
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
  });
});

test('Testing PUT/v1/admin/quiz/{quizid}/question/{questionid} works as intended', () => {
  // Creates a second question and gets the question id
  const responseQuestionCreate = requestAdminQuizQuestionCreate(
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
  const question2Id = responseQuestionCreate.body.questionId;

  // Updates the question created before the test
  const responseQuestionUpdate = requestAdminQuizQuestionUpdate(
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
  const timeEdited = Math.floor(Date.now() / 1000);
  expect(responseQuestionUpdate.body).toStrictEqual({});
  expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);

  // Gets the latest details of the quiz with the first and second question
  const responseQuizDetails = requestGetQuiz(quizId, session);
  // Checks that the details of the quiz is correct and that the question
  // was succefully updated
  expect(responseQuizDetails.body).toStrictEqual({
    quizId: quizId,
    name: 'Quiz Name',
    timeCreated: timeCreated,
    timeLastEdited: timeEdited,
    description: 'Description',
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
          }
        ]
      }
    ],
    timeLimit: expect.any(Number)
  });
  expect(responseQuizDetails.statusCode).toStrictEqual(OK);
});
