import {
  requestClear,
  responseInterface,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminQuizTransfer,
  requestAdminAuthRegister,
  requestAdminQuizCreate
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
const quizIdOffset = 727;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let session: string;
let session2: string;
let quizId: number;
let quizId2: number;
let quizId3: number;


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
  responseCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseCreate.body.quizId;

  responseRegister = requestAdminAuthRegister(
    'z7277273@ad.unsw.edu.au',
    'Password2',
    'First2',
    'Last2'
  );
  session2 = responseRegister.body.session;
  requestAdminAuthLogin('z7277232@ad.unsw.edu.au','Password2');
  responseCreate = requestAdminQuizCreate(
    session2,
    'Name2',
    'Description2'
  );
  quizId2 = responseCreate.body.quizId2;
});

// error 400 (BADREQUEST)
describe('error code 400 cases', () => {
  test.each([
    {
      description: 'userEmail is not a real user',
      quizId: quizId,
      session: session,
      email: 'zNOTREAL@ad.unsw.edu.au',
    },
    {
      description: 'userEmail is the current logged in user',
      quizId: quizId,
      session: session,
      email: 'z7277272@ad.unsw.edu.au',
    },
  ])('$description', ({quizId, session, email}) => {
    const invalidRes = requestAdminQuizTransfer(quizId, session, email);
    expect(invalidRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidRes.statusCode).toStrictEqual(BADREQUEST);
  })

  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    requestAdminAuthLogout(session2);
    // same name as quizId2 name 
    responseCreate = requestAdminQuizCreate(
      session,
      'Name2',
      'Description3'
    );
    quizId3 = responseCreate.body.quizId3;
    const invalidQuizIdlRes = requestAdminQuizTransfer(quizId3, session, 'z7277273@ad.unsw.edu.au');
    expect(invalidQuizIdlRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidQuizIdlRes.statusCode).toStrictEqual(BADREQUEST);
  });
});

// error 401(UNAUTHORISED)
describe('Session is empty or invalid (does not refer to valid logged in user session)', () => {
  test('session invalid', () => {
    const invalidSessionRes = requestAdminQuizTransfer(quizId, session + 'Invalid Offset', 'z7277273@ad.unsw.edu.au');
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
  });
  test('Session is logged out', () => {
    requestAdminAuthLogout(session);
    const invalidSessionRes = requestAdminQuizTransfer(quizId, session, 'z7277273@ad.unsw.edu.au');
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
  });

  test('Session with no quizzes', () => {
    const validRes = requestAdminQuizTransfer(quizId, session, 'z7277273@ad.unsw.edu.au');
    expect(validRes.body).toStrictEqual({});
    expect(validRes.statusCode).toStrictEqual(OK);
    // transfer after no more quizzes in session
    const emptyRes = requestAdminQuizTransfer(quizId, session, 'z7277273@ad.unsw.edu.au');
    expect(emptyRes.body).toStrictEqual({ error: expect.any(String) });
    expect(emptyRes.statusCode).toStrictEqual(UNAUTHORISED);
  });

  // does session recieving the tranfer need to be logged in?
});

// error 403
describe('Valid session is provided, but user is not an owner of this quiz or quiz does not exist', () => {
  test('User is not owner of quiz', () => {
    // quizId2 is owned by session2 not session
    const invalidSessionRes = requestAdminQuizTransfer(quizId2, session, 'z7277273@ad.unsw.edu.au');
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(FORBIDDEN);
  });

  test('quizId does not exist', () => {
    const invalidSessionRes = requestAdminQuizTransfer(quizId + quizIdOffset, session, 'z7277273@ad.unsw.edu.au');
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(FORBIDDEN);
  });
});

describe('Valid case', () => {
  test('Valid email, session, quizid, etc', () => {
    const validRes = requestAdminQuizTransfer(quizId, session, 'z7277273@ad.unsw.edu.au');
    expect(validRes.body).toStrictEqual({});
    expect(validRes.statusCode).toStrictEqual(OK);
  });
});
