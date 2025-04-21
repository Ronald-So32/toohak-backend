import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestGetQuiz,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import { describe } from 'node:test';

// TODO: VALIDATE THUMBNAIL

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
    // Checks that a valid call to create question returns a questionId object
    // and a status code 200
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Testing status code of 401 return values', () => {
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
        // Checks that an unauthorised call to create question returns an error object and
        // a status code of 401
        expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionCreate.statusCode).toStrictEqual(UNAUTHORISED);
      });
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
        // Checks that a forbidden call to create question returns an error object and
        // a status code of 403
        expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionCreate.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Quiz does not exist', () => {
        const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
                ],
                thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
                ],
                thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
            quizId,
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
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
            quizId,
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
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
                ],
                thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
            }
          };

          requestAdminQuizQuestionCreateV2(
            quizId,
            session,
            questionBody
          );
          requestAdminQuizQuestionCreateV2(
            quizId,
            session,
            questionBody
          );
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
              ],
              thumbnailUrl: 'http://google.com/some/image/path.jpg'
            }
          };
          requestAdminQuizQuestionCreateV2(
            quizId,
            session,
            questionBody
          );
          requestAdminQuizQuestionCreateV2(
            quizId,
            session,
            questionBody
          );
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
            const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
                  ],
                  thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
                ],
                thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
          const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
                ],
                thumbnailUrl: 'http://google.com/some/image/path.jpg'
              }
            }
          );
          expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
        });
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
                thumbnailUrl
              }
            }
          );
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
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
                thumbnailUrl
              }
            }
          );
          expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(OK);
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
                thumbnailUrl
              }
            }
          );
          expect(responseQuestionCreate.body).toStrictEqual({ error: expect.any(String) });
          expect(responseQuestionCreate.statusCode).toStrictEqual(BADREQUEST);
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
                thumbnailUrl
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
    let responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }
      }
    );
    const question1Id = responseQuestionCreate.body.questionId;
    expect(responseQuestionCreate.body).toStrictEqual({ questionId: expect.any(Number) });
    expect(responseQuestionCreate.statusCode).toStrictEqual(OK);

    // Creates another question and gets it's id and time question was created
    responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
    responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
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
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
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
        },
        {
          question: 'Question2',
          questionId: question2Id,
          timeLimit: 4,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
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
            },
            {
              answer: 'Maybe',
              colour: expect.any(String),
              correct: false,
              answerId: expect.any(Number)
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
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
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
            },
            {
              answer: 'Maybe',
              colour: expect.any(String),
              correct: false,
              answerId: expect.any(Number)
            }
          ],
        }
      ],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(OK);
  });
});
