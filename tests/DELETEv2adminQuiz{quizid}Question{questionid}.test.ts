import {
  requestClear,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestAdminQuizQuestionCreateV2,
  requestDeleteQuizQuestionV2,
  requestAdminQuizTransfer,
  requestGetQuizV2,
  // requestAdminStartGame,
  // requestPlayerJoin,
  // requestAdminUpdateGame,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset,
  questionIdOffset
} from './testsHelper';

import { describe } from 'node:test';

let responseQuizGet: responseInterface;
let session: string;
let quizId: number;
let questionId: number;
let timeCreated: number;
let timeEdited: number;

// Before each test clears the data then registers a user, gets the
// current session then creates a quiz and gets the quiz and question id
// with the quiz details
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
  const responseQuestion = requestAdminQuizQuestionCreateV2(
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
            answer: 'Queen Elizibeth',
            correct: false
          }
        ],
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    }
  );
  timeEdited = Math.floor(Date.now() / 1000);
  questionId = responseQuestion.body.questionId;
  responseQuizGet = requestGetQuizV2(quizId, session);
});

describe('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  describe('Test correct return type and normal usage case', () => {
    test('Testing the code 200 return value', () => {
      // Deletes the question and gets the response
      const responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      // Checks that a valid deletion returns an empty object and a
      // status code of 200
      expect(responseQuestionDelete.body).toStrictEqual({});
      expect(responseQuestionDelete.statusCode).toStrictEqual(OK);
    });
  });

  describe('Test error cases', () => {
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
        const responseQuestionDelete = requestDeleteQuizQuestionV2(
          quizId,
          questionId,
          session
        );
        // Checks that an unauthorised deletion returns an error object and a
        // status code of 401
        expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionDelete.statusCode).toStrictEqual(UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseQuestionDelete = requestDeleteQuizQuestionV2(
          quizId + quizIdOffset,
          questionId,
          session
        );
        // Checks that a forbidden deletion returns an error object and a
        // status code of 403
        expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionDelete.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;
        const responseQuestionDelete = requestDeleteQuizQuestionV2(
          quizId,
          questionId,
          session
        );
        expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
        expect(responseQuestionDelete.statusCode).toStrictEqual(FORBIDDEN);
      });
    });

    test('Question id is invalid', () => {
      const responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId + questionIdOffset,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(BADREQUEST);

      // Check quiz has not been deleted
      const responseQuizGet2 = requestGetQuizV2(quizId, session);
      expect(responseQuizGet2.body).toStrictEqual(responseQuizGet.body);
      expect(responseQuizGet2.statusCode).toStrictEqual(OK);
    });

    /*
    test('Testing when any game for this quiz is not in END state', () => {
      const responseGameStart = requestAdminStartGame(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      let responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(BADREQUEST);

      requestAdminUpdateGame(quizId, gameId, session, 'NEXT_QUESTION');

      responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(BADREQUEST);

      requestAdminUpdateGame(quizId, gameId, session, 'SKIP_COUNTDOWN');

      responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(BADREQUEST);

      requestAdminUpdateGame(quizId, gameId, session, 'GO_TO_ANSWER');

      responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(BADREQUEST);

      requestAdminUpdateGame(quizId, gameId, session, 'GO_TO_FINAL_RESULTS');

      responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(BADREQUEST);

    });

    test('Testing when game is in END state', () => {
      const responseGameStart = requestAdminStartGame(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      requestAdminUpdateGame(quizId, gameId, session, 'END');

      const responseQuestionDelete = requestDeleteQuizQuestionV2(
        quizId,
        questionId,
        session
      );
      expect(responseQuestionDelete.body).toStrictEqual({ error: expect.any(String) });
      expect(responseQuestionDelete.statusCode).toStrictEqual(BADREQUEST);
    });
  */
  });

  test('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid} works as intended', () => {
    // Registers a second user and gets it's session
    const responseRegister2 = requestAdminAuthRegister(
      'z6969@ad.unsw.edu.au',
      'Password2',
      'Firstt',
      'Lastt'
    );
    const session2 = responseRegister2.body.session;

    // Transfer ownership to user 2
    const responseTransfer = requestAdminQuizTransfer(
      quizId,
      session,
      'z6969@ad.unsw.edu.au'
    );
    expect(responseTransfer.body).toStrictEqual({});
    expect(responseTransfer.statusCode).toStrictEqual(OK);

    // Fail because its no longer user 1's quiz
    responseQuizGet = requestGetQuizV2(quizId, session);
    expect(responseQuizGet.body).toStrictEqual({ error: expect.any(String) });
    expect(responseQuizGet.statusCode).toStrictEqual(FORBIDDEN);

    // Check it is user 2's quiz
    responseQuizGet = requestGetQuizV2(quizId, session2);
    expect(responseQuizGet.body).toStrictEqual({
      description: 'Description',
      name: 'Name',
      quizId: 2,
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      numQuestions: 1,
      questions: [
        {
          questionId: 3,
          question: 'Who is the Monarch of England?',
          timeLimit: 4,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          points: 5,
          answerOptions: [
            {
              answer: 'Prince Charles',
              colour: expect.any(String),
              correct: true,
              answerId: 1,
            },
            {
              answer: 'Queen Elizibeth',
              colour: expect.any(String),
              correct: false,
              answerId: 2,
            },
          ],
        },
      ],
      timeLimit: 4,
    });
    expect(responseQuizGet.statusCode).toStrictEqual(OK);

    // Delete from user 2
    const responseQuestionDelete = requestDeleteQuizQuestionV2(
      quizId,
      questionId,
      session2
    );
    timeEdited = Math.floor(Date.now() / 1000);
    expect(responseQuestionDelete.body).toStrictEqual({});
    expect(responseQuestionDelete.statusCode).toStrictEqual(OK);

    // Check its gone in user 2
    responseQuizGet = requestGetQuizV2(quizId, session2);
    expect(responseQuizGet.body).toStrictEqual({
      quizId: 2,
      name: 'Name',
      description: 'Description',
      timeCreated: timeCreated,
      timeLastEdited: timeEdited,
      numQuestions: 0,
      questions: [],
      timeLimit: 0
    });
    expect(responseQuizGet.statusCode).toStrictEqual(OK);
  });
});
