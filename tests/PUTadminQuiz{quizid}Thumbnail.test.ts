import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizThumbnailUpdate,
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
    const responseThumbnail = requestAdminQuizThumbnailUpdate(
      quizId,
      session,
      "http://google.com/some/image/path.jpg"
    );
    expect(responseThumbnail.body).toStrictEqual({});
    expect(responseThumbnail.statusCode).toStrictEqual(OK);
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
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId,
          session,
          "http://google.com/some/image/path.jpg"
        );
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
        expect(responseThumbnail.statusCode).toStrictEqual(UNAUTHORISED);
      });
    })
    
    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId + quizIdOffset,
          session,
          "http://google.com/some/image/path.jpg"
        );
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
        expect(responseThumbnail.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId,
          session,
          "http://google.com/some/image/path.jpg"
        );
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
        expect(responseThumbnail.statusCode).toStrictEqual(FORBIDDEN);
      });
    })
    

    describe('Testing invalid urls', () => {
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
          thumbnailUrl: 'http://google.com/some/image/path.gepj',
          description: 'File type where jpeg is other way around'
        },
      ])('$description', ({ thumbnailUrl }) => {
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId + quizIdOffset,
          session,
          thumbnailUrl
        );
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
      expect(responseThumbnail.statusCode).toStrictEqual(BADREQUEST);
      })
    })

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
        }
      ])('$description', ({ thumbnailUrl }) => {
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId + quizIdOffset,
          session,
          thumbnailUrl
        );
        expect(responseThumbnail.body).toStrictEqual({});
        expect(responseThumbnail.statusCode).toStrictEqual(OK);
      })
    })

    describe('Testing invalid urls', () => {
      test.each([
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
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId + quizIdOffset,
          session,
          thumbnailUrl
        );
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
      expect(responseThumbnail.statusCode).toStrictEqual(BADREQUEST);
      })
    })

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
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId + quizIdOffset,
          session,
          thumbnailUrl
        );
        expect(responseThumbnail.body).toStrictEqual({});
        expect(responseThumbnail.statusCode).toStrictEqual(OK);
      })
    })
  });

  test('Testing PUT /v1/admin/quiz/{quizid}/thumbnail works as intended', () => {

  });
});
