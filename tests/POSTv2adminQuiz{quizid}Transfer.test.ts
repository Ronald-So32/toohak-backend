import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizTransferV2,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestGetQuizV2,
  requestGetQuizList,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

let session: string;
let session2: string;
let quizId: number;
let quizId2: number;
let timeCreated: number;

// Before each test clears the data and registers two users then
// creates a quiz for each using their session and obtains their quiz id
// and time created
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
    'Quiz Name',
    'Quiz Description'
  );
  timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;

  const responseRegister2 = requestAdminAuthRegister(
    'z6969@ad.unsw.edu.au',
    'Password2',
    'Firstt',
    'Lastt'
  );
  session2 = responseRegister2.body.session;

  const responseCreate2 = requestAdminQuizCreate(
    session2,
    'Quiz Namee',
    'Quiz Descriptionn'
  );
  quizId2 = responseCreate2.body.quizId;

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
});

describe('Testing POST /v1/admin/quiz/{quizid}/transfer', () => {
  test('Testing the code 200 return value', () => {
    // Transfers the quiz then gets it's response
    const responseTransfer = requestAdminQuizTransferV2(
      quizId,
      session,
      'z6969@ad.unsw.edu.au'
    );
    // Checks that a valid response returns an empty object and a
    // status code of 200
    expect(responseTransfer.body).toStrictEqual({});
    expect(responseTransfer.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Error 400: Bad Request', () => {
      test('userEmail is not a real user', () => {
        const responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session,
          'nonexistent@example.com'
        );
        // Checks that an invalid transfer of quiz returns an error object
        // and a status code of 400
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);
      });

      test('userEmail is the current logged in user', () => {
        // Try to transfer to self
        const responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session,
          'z7277272@ad.unsw.edu.au'
        );
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
      });

      test('Quiz name conflict with target user', () => {
        const responseCreate3 = requestAdminQuizCreate(
          session,
          'Quiz Namee',
          'Quiz Descriptionn'
        );
        expect(responseCreate3.body).toStrictEqual({ quizId: expect.any(Number) });
        expect(responseCreate3.statusCode).toStrictEqual(OK);

        // Try to transfer quiz with duplicate name
        const responseTransfer = requestAdminQuizTransferV2(
          responseCreate3.body.quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);
      });

      test('Testing when any game for this quiz is not in END state', () => {
        // Start a new game and gets the game id
        const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
        const gameId = responseGameStart.body.gameId;
        let responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);

        // Update the state of the game
        requestAdminQuizGameStateUpdate(quizId, gameId, session, 'NEXT_QUESTION');

        responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);

        requestAdminQuizGameStateUpdate(quizId, gameId, session, 'SKIP_COUNTDOWN');

        responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);

        requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_ANSWER');

        responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);

        requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_FINAL_RESULTS');

        responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);
      });
    });

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
        const responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        // Checks that an unauthorised call to create question returns an error object and
        // a status code of 401
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(UNAUTHORISED);
      });
    });
    describe('Error 403: Forbidden', () => {
      test('User does not own the quiz', () => {
        // Create third user who will be the target
        const responseRegister3 = requestAdminAuthRegister(
          'z69420@ad.unsw.edu.au',
          'Password3',
          'Firsttt',
          'Lasttt'
        );
        const session3 = responseRegister3.body.session;

        // User3 tries to transfer User1's quiz to User2
        const responseTransfer = requestAdminQuizTransferV2(
          quizId,
          session3,
          'z6969@ad.unsw.edu.au'
        );
        // Checks that a forbidden transfer returns an error object and a
        // status code of 403
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Quiz does not exist', () => {
        // Try to transfer non-existent quiz
        const responseTransfer = requestAdminQuizTransferV2(
          quizId + quizIdOffset,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.statusCode).toStrictEqual(FORBIDDEN);
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
      });

      test('Quiz can no longer be transferred after first transfer', () => {
      // First transfer (user1 -> user2)
        const transfer1Result = requestAdminQuizTransferV2(
          quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(transfer1Result.statusCode).toStrictEqual(OK);

        // Second transfer attempt (user1 -> user3)
        const transfer2Result = requestAdminQuizTransferV2(
          quizId,
          session,
          'z69420@ad.unsw.edu.au'
        );
        expect(transfer2Result.statusCode).toStrictEqual(FORBIDDEN);
        expect(transfer2Result.body).toStrictEqual({ error: expect.any(String) });
      });
    });

    test('Testing when game is in END state', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      const gameId = responseGameStart.body.gameId;
      requestAdminQuizGameStateUpdate(quizId, gameId, session, 'END');

      const responseTransfer = requestAdminQuizTransferV2(
        quizId,
        session,
        'z6969@ad.unsw.edu.au'
      );
      expect(responseTransfer.body).toStrictEqual({});
      expect(responseTransfer.statusCode).toStrictEqual(OK);
    });
  });

  test('Testing POST /v1/admin/quiz/{quizid}/transfer works as intended', () => {
    // Check user1 has the quiz
    const responseQuizGet = requestGetQuizList(session);
    expect(responseQuizGet.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz Name'
        }
      ]
    });
    expect(responseQuizGet.statusCode).toStrictEqual(OK);

    // Check user2 has a different quiz
    const responseQuizGet2 = requestGetQuizList(session2);
    expect(responseQuizGet2.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId2,
          name: 'Quiz Namee'
        }
      ]
    });
    expect(responseQuizGet2.statusCode).toStrictEqual(OK);

    // Transfer quiz from user1 to user2
    const responseTransfer = requestAdminQuizTransferV2(
      quizId,
      session,
      'z6969@ad.unsw.edu.au'
    );
    expect(responseTransfer.body).toStrictEqual({});
    expect(responseTransfer.statusCode).toStrictEqual(OK);

    // Check user2 now has the quiz
    const responseQuizGet3 = requestGetQuizList(session2);
    expect(responseQuizGet3.body).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz Name'
        },
        {
          quizId: quizId2,
          name: 'Quiz Namee'
        },
      ]
    });
    expect(responseQuizGet3.statusCode).toStrictEqual(OK);

    // Check that the transferred quiz has the correct timeCreated
    const responseQuizDetails = requestGetQuizV2(quizId, session2);
    responseQuizDetails.body.timeCreated = timeCreated;

    // Check user1 no longer has the quiz
    const responseQuizGet4 = requestGetQuizList(session);
    expect(responseQuizGet4.body).toStrictEqual({ quizzes: [] });
    expect(responseQuizGet3.statusCode).toStrictEqual(OK);
  });
});
