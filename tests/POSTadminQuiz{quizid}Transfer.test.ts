import {
  requestClear,
  responseInterface,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestAdminQuizTransfer,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestGetQuizList
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
let listBefore: responseInterface;
let listBefore2: responseInterface;



describe('Valid case', () => {
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
  test('Valid email, session, quizid, etc', () => {
    const validRes = requestAdminQuizTransfer(quizId, session, 'z7277273@ad.unsw.edu.au');
    expect(validRes.body).toStrictEqual({});
    expect(validRes.statusCode).toStrictEqual(OK);
    expect(requestGetQuizList(session2).body).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Name',
        },
      ]
    });
  });
});


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

  // get quiz list before calling admintransfer
  listBefore = requestGetQuizList(session);
  // check session2 did not recieve quiz from session 1
  listBefore2 = requestGetQuizList(session2);
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
    // check that tranasfer has not occured
    expect(requestGetQuizList(session).body).toStrictEqual(listBefore.body);
    expect(requestGetQuizList(session2).body).toStrictEqual(listBefore2.body);
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
    // check that tranasfer has not occured
    expect(requestGetQuizList(session).body).toStrictEqual(listBefore.body);
    expect(requestGetQuizList(session2).body).toStrictEqual(listBefore2.body);
  });
});

// error 401(UNAUTHORISED)
describe('Session is empty or invalid (does not refer to valid logged in user session)', () => {
  test('session invalid', () => {
    const invalidSessionRes = requestAdminQuizTransfer(quizId, session + 'Invalid Offset', 'z7277273@ad.unsw.edu.au');
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
    // check that tranasfer has not occured
    expect(requestGetQuizList(session).body).toStrictEqual(listBefore.body);
    expect(requestGetQuizList(session2).body).toStrictEqual(listBefore2.body);
  });
  test('Session is logged out', () => {
    requestAdminAuthLogout(session);
    const invalidSessionRes = requestAdminQuizTransfer(quizId, session, 'z7277273@ad.unsw.edu.au');
    expect(invalidSessionRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidSessionRes.statusCode).toStrictEqual(UNAUTHORISED);
    // check that tranasfer has not occured
    expect(requestGetQuizList(session).body).toStrictEqual(listBefore.body);
    expect(requestGetQuizList(session2).body).toStrictEqual(listBefore2.body);
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
describe('error 403 cases', () => {
  test.each([
    {
      description: 'User is not owner of quiz',
      quizId: quizId2,
      session: session,
      email: 'z7277273@ad.unsw.edu.au',
    },
    {
      description: 'quizId does not exist',
      quizId: quizId + quizIdOffset,
      session: session,
      email: 'z7277273@ad.unsw.edu.au'
    },
  ])('$description', ({quizId, session, email}) => {
    
    const invalidRes = requestAdminQuizTransfer(quizId, session, email);
    expect(invalidRes.body).toStrictEqual({ error: expect.any(String) });
    expect(invalidRes.statusCode).toStrictEqual(FORBIDDEN);
    // check that tranasfer has not occured
    expect(requestGetQuizList(session).body).toStrictEqual(listBefore.body);
    expect(requestGetQuizList(session2).body).toStrictEqual(listBefore2.body);
  });
});

