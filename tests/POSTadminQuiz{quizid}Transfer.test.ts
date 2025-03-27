import {
  requestClear,
  responseInterface,
  requestAdminAuthRegister,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminQuizTransfer,
  requestAdminQuizCreate,
  requestGetQuizList
} from './testsHelper';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;

let responseRegister: responseInterface;
let responseRegister2: responseInterface;
let responseCreate: responseInterface;
let responseCreate2: responseInterface;
let session: string;
let session2: string;
let quizId: number;
let quizId2: number;

beforeEach(() => {
  requestClear();
  responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;

  responseCreate = requestAdminQuizCreate(
    session,
    'Quiz Name',
    'Quiz Description'
  );
  quizId = responseCreate.body.quizId;

  responseRegister2 = requestAdminAuthRegister(
    'z6969@ad.unsw.edu.au',
    'Password2',
    'Firstt',
    'Lastt'
  );
  session2 = responseRegister2.body.session;

  responseCreate2 = requestAdminQuizCreate(
    session2,
    'Quiz Namee',
    'Quiz Descriptionn'
  );
  quizId2 = responseCreate2.body.quizId;
});

describe('Testing POST /v1/admin/quiz/{quizid}/transfer', () => {
  test('Testing the code 200 return value', () => {
    const responseTransfer = requestAdminQuizTransfer(
      quizId,
      session,
      'z6969@ad.unsw.edu.au'
    );
    expect(responseTransfer.body).toStrictEqual({});
    expect(responseTransfer.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    describe('Error 400: Bad Request', () => {
      test('userEmail is not a real user', () => {
        // Try to transfer to non-existent user
        const transferResult = requestAdminQuizTransfer(
          quizId,
          session,
          'nonexistent@example.com'
        );
        expect(transferResult.body).toStrictEqual({ error: expect.any(String) });
        expect(transferResult.statusCode).toStrictEqual(BADREQUEST);
      });

      test('userEmail is the current logged in user', () => {
        // Try to transfer to self
        const transferResult = requestAdminQuizTransfer(
          quizId,
          session,
          'z7277272@ad.unsw.edu.au'
        );
        expect(transferResult.statusCode).toStrictEqual(BADREQUEST);
        expect(transferResult.body).toStrictEqual({ error: expect.any(String) });
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
        const transferResult = requestAdminQuizTransfer(
          responseCreate3.body.quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(transferResult.body).toStrictEqual({ error: expect.any(String) });
        expect(transferResult.statusCode).toStrictEqual(BADREQUEST);
      });
    });

    describe('Error 401: Unauthorized', () => {
      test('Invalid session', () => {
        const transferResult = requestAdminQuizTransfer(
          quizId,
          session + 'Invalid Session',
          'z6969@ad.unsw.edu.au'
        );
        expect(transferResult.statusCode).toStrictEqual(UNAUTHORISED);
        expect(transferResult.body).toStrictEqual({ error: expect.any(String) });
      });

      test('Logged out user', () => {
        requestAdminAuthLogout(session);

        // Try to transfer with logged out session
        const transferResult = requestAdminQuizTransfer(
          quizId,
          session,
          'z6969@ad.unsw.edu.au'
        );
        expect(transferResult.statusCode).toStrictEqual(UNAUTHORISED);
        expect(transferResult.body).toStrictEqual({ error: expect.any(String) });
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
        const transferResult = requestAdminQuizTransfer(
          quizId,
          session3,
          'z6969@ad.unsw.edu.au'
        );
        expect(transferResult.statusCode).toStrictEqual(FORBIDDEN);
        expect(transferResult.body).toStrictEqual({ error: expect.any(String) });
      });

      test('Quiz does not exist', () => {

      });
    });

    test('Quiz can no longer be transferred after first transfer', () => {

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

    // Check user1 no longer has the quiz
    const responseQuizGet4 = requestGetQuizList(session);
    expect(responseQuizGet4.body).toStrictEqual({ quizzes: [] });
    expect(responseQuizGet3.statusCode).toStrictEqual(OK);
  });
});
