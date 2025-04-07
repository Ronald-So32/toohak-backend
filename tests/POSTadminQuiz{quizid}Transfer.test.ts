import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizTransfer,
  requestAdminQuizCreate,
  requestGetQuiz,
  requestGetQuizList
} from './testsHelper';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;

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
});

describe('Testing POST /v1/admin/quiz/{quizid}/transfer', () => {
  test('Testing the code 200 return value', () => {
    // Transfers the quiz then gets it's response
    const responseTransfer = requestAdminQuizTransfer(
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
        const responseTransfer = requestAdminQuizTransfer(
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
        const responseTransfer = requestAdminQuizTransfer(
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
        const responseTransfer = requestAdminQuizTransfer(
          responseCreate3.body.quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
        expect(responseTransfer.statusCode).toStrictEqual(BADREQUEST);
      });
    });

    describe('Error 401: Unauthorized', () => {
      test('Invalid session', () => {
        const responseTransfer = requestAdminQuizTransfer(
          quizId,
          session + 'Invalid Session',
          'z6969@ad.unsw.edu.au'
        );
        // Checks that an unauthorised transfer returns an errors object and a
        // status code of 401
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
        const responseTransfer = requestAdminQuizTransfer(
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
        const responseTransfer = requestAdminQuizTransfer(
          quizId + quizIdOffset,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(responseTransfer.statusCode).toStrictEqual(FORBIDDEN);
        expect(responseTransfer.body).toStrictEqual({ error: expect.any(String) });
      });
    });

    test('Quiz can no longer be transferred after first transfer', () => {
      // First transfer (user1 -> user2)
      const transfer1Result = requestAdminQuizTransfer(
        quizId,
        session,
        'z6969@ad.unsw.edu.au'
      );
      expect(transfer1Result.statusCode).toStrictEqual(OK);

      // Second transfer attempt (user1 -> user3)
      const transfer2Result = requestAdminQuizTransfer(
        quizId,
        session,
        'z69420@ad.unsw.edu.au'
      );
      expect(transfer2Result.statusCode).toStrictEqual(FORBIDDEN);
      expect(transfer2Result.body).toStrictEqual({ error: expect.any(String) });
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
    const responseTransfer = requestAdminQuizTransfer(
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
    const responseQuizDetails = requestGetQuiz(quizId, session2);
    responseQuizDetails.body.timeCreated = timeCreated;

    // Check user1 no longer has the quiz
    const responseQuizGet4 = requestGetQuizList(session);
    expect(responseQuizGet4.body).toStrictEqual({ quizzes: [] });
    expect(responseQuizGet3.statusCode).toStrictEqual(OK);
  });
});
