
import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizQuestionUpdateV2,
  requestAdminAuthLogout,
  requestGetQuizV2,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN
} from './testsHelper';

import { describe } from 'node:test';

const quizIdOffset = 727;
const questionIdOffset = 999;

let session: string;
let quizId: number;
let questionId: number;
let timeCreated: number;

// Before each test clears the data and registers a user and creates a quiz
// and question and gets the current session, quiz id and question id
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

  const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
  );
  questionId = responseQuestionCreate.body.questionId;
});

describe('Testing PUT /v2/admin/quiz/{quizid}/qusetion/{questionid}', () => {
  test('Testing correct return value', () => {
    // Updates the question and gets the response
    const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
            }
          }
        );
        // Checks that an unauthorised call to update question returns an error object
        // and a status code of 401
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(UNAUTHORISED);
      });

      test('Invalid user session', () => {
        requestAdminAuthLogout(session);
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
            }
          }
        );
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(UNAUTHORISED);
      });
    });

    describe('Test cases for error 403', () => {
      test('Invalid questionId', () => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
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

        requestAdminQuizQuestionCreateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
            }
          }
        );

        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
            }
          }
        );
        // Checks that forbidden call to update question returns an error object and
        // a status code of 403
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Quiz does not exist', () => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
          quizId,
          questionId,
          session,
          {
            questionBody: {
              question: 'Question',
              timeLimit: 4,
              points: 5,
              answerOptions,
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
          quizId,
          questionId,
          session,
          {
            questionBody: {
              question: 'Question',
              timeLimit: 4,
              points: 5,
              answerOptions,
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
            ],
            thumbnailUrl: 'http://google.com/some/image/path.jpg'
          }
        };
        // Creates 3 questions that has a summed time limit of under 3 minutes
        const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
          quizId,
          session,
          questionBody
        );
        questionId = responseQuestionCreate.body.questionId;

        requestAdminQuizQuestionCreateV2(quizId, session, questionBody);
        requestAdminQuizQuestionCreateV2(quizId, session, questionBody);

        // Update the first question so that the time limit summed with
        // the other two question will exceed 3 minutes
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
            }
          }
        );
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
      });
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
      const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
            ],
            thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    };
    // Creates 3 question with summed time limit of under 3 minute
    const responseQuestionCreate = requestAdminQuizQuestionCreateV2(quizId, session, questionBody);
    questionId = responseQuestionCreate.body.questionId;

    requestAdminQuizQuestionCreateV2(quizId, session, questionBody);
    requestAdminQuizQuestionCreateV2(quizId, session, questionBody);

    // Change time limit of first question so that the sum with other two
    // question is exactly 3 minutes
    const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(quizId,
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
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }
      }
    );
    expect(responseQuestionUpdate.body).toStrictEqual({});
    expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
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
      const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
            ],
            thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
      const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
            ],
            thumbnailUrl: 'http://google.com/some/image/path.jpg'
          }
        }
      );
      expect(responseQuestionUpdate.body).toStrictEqual({});
      expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
    });
  });

  describe('Testing thumbnailUrl', () => {
    describe('Testing invalid file types', () => {
      test.each([
        {
          thumbnailUrl: 'http://google.com/some/image/path.gif',
          description: 'File type of .gif at the end'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.txt',
          description: 'File type of .txt at the end'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.gpj',
          description: 'File type where jpg is other way around'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.gnp',
          description: 'File type where png is other way around'
        },
        {
          thumbnailUrl: 'http://google.fcom/some/image/path.gepj',
          description: 'File type where jpeg is other way around'
        },
      ])('$description', ({ thumbnailUrl }) => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
          quizId,
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
              ],
              thumbnailUrl
            }
          }
        );
        expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
      });
    });

    describe('Testing valid file types', () => {
      test.each([
        {
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          description: 'File type of .jpg at the end'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.jpeg',
          description: 'File type of .jpeg at the end'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.png',
          description: 'File type of .png at the end'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.JPG',
          description: 'File type of .jpg at the end in capital case'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.JPEG',
          description: 'File type of .jpeg at the end in capital case'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.PNG',
          description: 'File type of .png at the end in capital case'
        }
      ])('$description', ({ thumbnailUrl }) => {
        const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
          quizId,
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
              ],
              thumbnailUrl
            }
          }
        );
        expect(responseQuestionUpdate.body).toStrictEqual({});
        expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
      });
    });
  });

  describe('Testing invalid urls', () => {
    test.each([
      {
        thumbnailUrl: '',
        description: 'Url is empty'
      },
      {
        thumbnailUrl: 'google.com/some/image/path.jpg',
        description: 'Url beginning with domain name'
      },
      {
        thumbnailUrl: 'www.google.com/some/image/path.jpeg',
        description: 'Url beginning with www.'
      },
      {
        thumbnailUrl: 'gg.http://google.com/some/image/path.jpg',
        description: 'Url where http:// is not at the beginning'
      },
      {
        thumbnailUrl: 'gg.https://google.com/some/image/path.jpg',
        description: 'Url where https:// is not at the beginning'
      },
      {
        thumbnailUrl: 'gg.https://google.com/some/image/path.jpg',
        description: 'Url where https:// is not at the beginning'
      },
      {
        thumbnailUrl: 'ptth://google.com/some/image/path.jpg',
        description: 'Url where http is other way around'
      },
      {
        thumbnailUrl: 'sptth://google.com/some/image/path.jpg',
        description: 'Url where https is other way around'
      },
    ])('$description', ({ thumbnailUrl }) => {
      const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
        quizId,
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
            ],
            thumbnailUrl
          }
        }
      );
      expect(responseQuestionUpdate.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionUpdate.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  describe('Testing valid urls', () => {
    test.each([
      {
        thumbnailUrl: 'http://google.com/some/image/path.jpg',
        description: 'Url beginning with http://'
      },
      {
        thumbnailUrl: 'https://google.com/some/image/path.jpeg',
        description: 'Url beginning with https://'
      }
    ])('$description', ({ thumbnailUrl }) => {
      const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
        quizId,
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
            ],
            thumbnailUrl
          }
        }
      );
      expect(responseQuestionUpdate.body).toStrictEqual({});
      expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);
    });
  });
});

test('Testing PUT/v2/admin/quiz/{quizid}/question/{questionid} works as intended', () => {
  // Creates a second question and gets the question id
  const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
  );
  const question2Id = responseQuestionCreate.body.questionId;

  // Updates the question created before the test
  const responseQuestionUpdate = requestAdminQuizQuestionUpdateV2(
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
        ],
        thumbnailUrl: 'http://google.com/some/image/path.png'
      }
    }
  );
  const timeEdited = Math.floor(Date.now() / 1000);
  expect(responseQuestionUpdate.body).toStrictEqual({});
  expect(responseQuestionUpdate.statusCode).toStrictEqual(OK);

  // Gets the latest details of the quiz with the first and second question
  const responseQuizDetails = requestGetQuizV2(quizId, session);
  // Checks that the details of the quiz is correct and that the question
  // was successfully updated
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
          }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.png'
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
            answerId: expect.any(Number)
          },
          {
            answer: 'Wrong',
            colour: expect.any(String),
            correct: false,
            answerId: expect.any(Number)
          }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    ],
    timeLimit: expect.any(Number)
  });
  expect(responseQuizDetails.statusCode).toStrictEqual(OK);
});
