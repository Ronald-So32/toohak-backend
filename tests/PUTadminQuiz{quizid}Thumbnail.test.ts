import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizThumbnail,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;

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
  quizId = responseCreate.body.quizId;
});

describe('Testing PUT /v1/admin/quiz/{quizid}/thumbnail', () => {
  test('Testing the code 200 return value', () => {
    const responseThumbnail = requestAdminQuizThumbnail(
      quizId,
      session,
      "http://google.com/some/image/path.jpg"
    );
    expect(responseDeleteQuiz.body).toStrictEqual({});
    expect(responseDeleteQuiz.statusCode).toStrictEqual(OK);
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
        const responseThumbnail = requestAdminQuizThumbnail(
          quizId,
          session,
          "http://google.com/some/image/path.jpg"
        );
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(UNAUTHORISED);
      });
    })
    
    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseThumbnail = requestAdminQuizThumbnail(
          quizId + quizIdOffset,
          session,
          "http://google.com/some/image/path.jpg"
        );
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;
        
        const responseThumbnail = requestAdminQuizThumbnail(
          quizId,
          session,
          "http://google.com/some/image/path.jpg"
        );
        expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
        expect(responseDeleteQuiz.statusCode).toStrictEqual(FORBIDDEN);
      });
    })
    

    test('Testing invalid file type', () => {
      const responseThumbnail = requestAdminQuizThumbnail(
        quizId,
        session,
        "http://google.com/some/image/path.gif"
      );
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing invalid url', () => {
      const responseThumbnail = requestAdminQuizThumbnail(
        quizId,
        session,
        "google.com/some/image/path.png"
      );
      expect(responseDeleteQuiz.body).toStrictEqual({ error: expect.any(String) });
      expect(responseDeleteQuiz.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  test('Testing PUT /v1/admin/quiz/{quizid}/thumbnail works as intended', () => {

  });
});
