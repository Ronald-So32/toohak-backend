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

// Don't define variables at the top level that are reset in beforeEach
// as tests might access outdated values

beforeEach(() => {
  requestClear();
});

describe('POST /v1/admin/quiz/{quizid}/transfer', () => {
  describe('Success case', () => {
    test('Valid transfer', () => {
      // Register first user and create a quiz
      const user1Register = requestAdminAuthRegister(
        'user1@example.com',
        'Password1',
        'First',
        'User'
      );
      const session1 = user1Register.body.session;

      const quizCreate = requestAdminQuizCreate(
        session1,
        'Quiz Name',
        'Quiz Description'
      );
      const quizId = quizCreate.body.quizId;

      // Register second user
      const user2Register = requestAdminAuthRegister(
        'user2@example.com',
        'Password2',
        'Second',
        'User'
      );
      const session2 = user2Register.body.session;

      // Transfer quiz from user1 to user2
      const transferResult = requestAdminQuizTransfer(
        quizId,
        session1,
        'user2@example.com'
      );

      // Check transfer was successful
      expect(transferResult.statusCode).toStrictEqual(OK);
      expect(transferResult.body).toStrictEqual({});

      // Check user2 now has the quiz
      const user2Quizzes = requestGetQuizList(session2);
      expect(user2Quizzes.body.quizzes).toContainEqual(expect.objectContaining({
        quizId: quizId,
        name: 'Quiz Name'
      }));

      // Check user1 no longer has the quiz
      const user1Quizzes = requestGetQuizList(session1);
      expect(user1Quizzes.body.quizzes).not.toContainEqual(expect.objectContaining({
        quizId: quizId
      }));
    });
  });

  describe('Error 400: Bad Request', () => {
    test('userEmail is not a real user', () => {
      // Create a user and a quiz
      const userRegister = requestAdminAuthRegister(
        'user1@example.com',
        'Password1',
        'First',
        'User'
      );
      const session = userRegister.body.session;

      const quizCreate = requestAdminQuizCreate(
        session,
        'Quiz Name',
        'Quiz Description'
      );
      const quizId = quizCreate.body.quizId;

      // Try to transfer to non-existent user
      const transferResult = requestAdminQuizTransfer(
        quizId,
        session,
        'nonexistent@example.com'
      );

      // Check error response
      expect(transferResult.statusCode).toStrictEqual(BADREQUEST);
      expect(transferResult.body).toStrictEqual({
        error: expect.any(String)
      });
    });

    test('userEmail is the current logged in user', () => {
      // Create a user and a quiz
      const userRegister = requestAdminAuthRegister(
        'user1@example.com',
        'Password1',
        'First',
        'User'
      );
      const session = userRegister.body.session;

      const quizCreate = requestAdminQuizCreate(
        session,
        'Quiz Name',
        'Quiz Description'
      );
      const quizId = quizCreate.body.quizId;

      // Try to transfer to self
      const transferResult = requestAdminQuizTransfer(
        quizId,
        session,
        'user1@example.com'
      );

      // Check error response
      expect(transferResult.statusCode).toStrictEqual(BADREQUEST);
      expect(transferResult.body).toStrictEqual({
        error: expect.any(String)
      });
    });

    test('Quiz name conflict with target user', () => {
      // Create first user and quiz
      const user1Register = requestAdminAuthRegister(
        'user1@example.com',
        'Password1',
        'First',
        'User'
      );
      const session1 = user1Register.body.session;

      const quiz1Create = requestAdminQuizCreate(
        session1,
        'Duplicate Quiz Name',
        'Quiz Description'
      );
      const quizId1 = quiz1Create.body.quizId;

      // Create second user with same quiz name
      const user2Register = requestAdminAuthRegister(
        'user2@example.com',
        'Password2',
        'Second',
        'User'
      );
      const session2 = user2Register.body.session;

      requestAdminQuizCreate(
        session2,
        'Duplicate Quiz Name',
        'Another Description'
      );

      // Try to transfer quiz with duplicate name
      const transferResult = requestAdminQuizTransfer(
        quizId1,
        session1,
        'user2@example.com'
      );

      // Check error response
      expect(transferResult.statusCode).toStrictEqual(BADREQUEST);
      expect(transferResult.body).toStrictEqual({
        error: expect.any(String)
      });
    });
  });

  describe('Error 401: Unauthorized', () => {
    test('Invalid session', () => {
      // Create a user and a quiz
      const userRegister = requestAdminAuthRegister(
        'user1@example.com',
        'Password1',
        'First',
        'User'
      );
      const session = userRegister.body.session;

      const quizCreate = requestAdminQuizCreate(
        session,
        'Quiz Name',
        'Quiz Description'
      );
      const quizId = quizCreate.body.quizId;

      // Create another user to transfer to
      requestAdminAuthRegister(
        'user2@example.com',
        'Password2',
        'Second',
        'User'
      );

      // Try to transfer with invalid session
      const transferResult = requestAdminQuizTransfer(
        quizId,
        session + 'invalid',
        'user2@example.com'
      );

      // Check error response
      expect(transferResult.statusCode).toStrictEqual(UNAUTHORISED);
      expect(transferResult.body).toStrictEqual({
        error: expect.any(String)
      });
    });

    test('Logged out user', () => {
      // Create a user and a quiz
      const userRegister = requestAdminAuthRegister(
        'user1@example.com',
        'Password1',
        'First',
        'User'
      );
      const session = userRegister.body.session;

      const quizCreate = requestAdminQuizCreate(
        session,
        'Quiz Name',
        'Quiz Description'
      );
      const quizId = quizCreate.body.quizId;

      // Create another user to transfer to
      requestAdminAuthRegister(
        'user2@example.com',
        'Password2',
        'Second',
        'User'
      );

      // Log out
      requestAdminAuthLogout(session);

      // Try to transfer with logged out session
      const transferResult = requestAdminQuizTransfer(
        quizId,
        session,
        'user2@example.com'
      );

      // Check error response
      expect(transferResult.statusCode).toStrictEqual(UNAUTHORISED);
      expect(transferResult.body).toStrictEqual({
        error: expect.any(String)
      });
    });
  });

  describe('Error 403: Forbidden', () => {
    test('User does not own the quiz', () => {
      // Create first user and quiz
      const user1Register = requestAdminAuthRegister(
        'user1@example.com',
        'Password1',
        'First',
        'User'
      );
      const session1 = user1Register.body.session;

      const quizCreate = requestAdminQuizCreate(
        session1,
        'Quiz Name',
        'Quiz Description'
      );
      const quizId = quizCreate.body.quizId;

      // Create second user who will try to transfer someone else's quiz
      const user2Register = requestAdminAuthRegister(
        'user2@example.com',
        'Password2',
        'Second',
        'User'
      );
      const session2 = user2Register.body.session;

      // Create third user who will be the target
      requestAdminAuthRegister(
        'user3@example.com',
        'Password3',
        'Third',
        'User'
      );

      // User2 tries to transfer User1's quiz
      const transferResult = requestAdminQuizTransfer(
        quizId,
        session2,
        'user3@example.com'
      );

      // Check error response
      expect(transferResult.statusCode).toStrictEqual(FORBIDDEN);
      expect(transferResult.body).toStrictEqual({
        error: expect.any(String)
      });
    });

    test('Quiz does not exist', () => {
      // Create a user
      const userRegister = requestAdminAuthRegister(
        'user1@example.com',
        'Password1',
        'First',
        'User'
      );
      const session = userRegister.body.session;

      // Create target user
      requestAdminAuthRegister(
        'user2@example.com',
        'Password2',
        'Second',
        'User'
      );

      // Try to transfer non-existent quiz
      const nonExistentQuizId = 99999;
      const transferResult = requestAdminQuizTransfer(
        nonExistentQuizId,
        session,
        'user2@example.com'
      );

      // Check error response
      expect(transferResult.statusCode).toStrictEqual(FORBIDDEN);
      expect(transferResult.body).toStrictEqual({
        error: expect.any(String)
      });
    });
  });

  test('Quiz can no longer be transferred after first transfer', () => {
    // Register first user and create a quiz
    const user1Register = requestAdminAuthRegister(
      'user1@example.com',
      'Password1',
      'First',
      'User'
    );
    const session1 = user1Register.body.session;

    const quizCreate = requestAdminQuizCreate(
      session1,
      'Quiz Name',
      'Quiz Description'
    );
    const quizId = quizCreate.body.quizId;

    // Register second user
    const user2Register = requestAdminAuthRegister(
      'user2@example.com',
      'Password2',
      'Second',
      'User'
    );
    const session2 = user2Register.body.session;

    // Register third user
    requestAdminAuthRegister(
      'user3@example.com',
      'Password3',
      'Third',
      'User'
    );

    // First transfer (user1 -> user2)
    const transfer1Result = requestAdminQuizTransfer(
      quizId,
      session1,
      'user2@example.com'
    );

    expect(transfer1Result.statusCode).toStrictEqual(OK);

    // Second transfer attempt (user1 -> user3)
    const transfer2Result = requestAdminQuizTransfer(
      quizId,
      session1,
      'user3@example.com'
    );

    // User1 no longer owns the quiz, so it should fail
    expect(transfer2Result.statusCode).toStrictEqual(FORBIDDEN);
    expect(transfer2Result.body).toStrictEqual({
      error: expect.any(String)
    });
  });
});
