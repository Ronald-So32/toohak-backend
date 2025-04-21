import { time } from 'console';
import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizThumbnailUpdate,
  requestGetQuizV2,
} from './testsHelper';

import {
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
let timeCreated: number;

// Before each test clears existing data and registers an user, creating a quiz 
// then gets the session, time the quiz was created an the quizId.
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
  timeCreated = Math.floor(Date.now()/1000);
  quizId = responseCreate.body.quizId;
});

describe('Testing PUT /v1/admin/quiz/{quizid}/thumbnail', () => {
  test('Testing the code 200 return value', () => {
    // Updates the thumbnail of the quiz
    const responseThumbnail = requestAdminQuizThumbnailUpdate(
      quizId,
      session,
      'http://google.com/some/image/path.jpg'
    );
    // Checks that a valid request to update thumbnail returns an empty object
    // and a status code of 200
    expect(responseThumbnail.body).toStrictEqual({});
    expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.OK);
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
          'http://google.com/some/image/path.jpg'
        );
        // Checks that a unauthorised request to update thumbnail returns an empty object
        // and a status code of 401
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
        expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId + idOffset,
          session,
          'http://google.com/some/image/path.jpg'
        );
        // Checks that a forbidden request to update thumbnail returns an empty object
        // and a status code of 403
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
        expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z727697272@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId,
          session,
          'http://google.com/some/image/path.jpg'
        );
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
        expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });
    });

    describe('Testing invalid urls', () => {
      test.each([
        {
          thumbnailUrl: '',
          description: 'Empty string'
        },
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
          quizId,
          session,
          thumbnailUrl
        );
        // Checks that a invalid request to update thumbnail returns an empty object
        // and a status code of 401
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
        expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
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
        }
      ])('$description', ({ thumbnailUrl }) => {
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId,
          session,
          thumbnailUrl
        );
        expect(responseThumbnail.body).toStrictEqual({});
        expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.OK);
      });
    });

    describe('Testing More invalid urls', () => {
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
          quizId,
          session,
          thumbnailUrl
        );
        expect(responseThumbnail.body).toStrictEqual({ error: expect.any(String) });
        expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
      });
    });

    describe('Testing valid urls', () => {
      test.each([
        {
          thumbnailUrl: 'http://google.com/some/image/path.jpg',
          description: 'Url beginning with http:// and ending with jpg'
        },
        {
          thumbnailUrl: 'https://google.com/some/image/path.jpg',
          description: 'Url beginning with https:// and ending with jpg'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.jpeg',
          description: 'Url beginning with http:// and ending with jpeg'
        },
        {
          thumbnailUrl: 'https://google.com/some/image/path.jpeg',
          description: 'Url beginning with https:// and ending with jpeg'
        },
        {
          thumbnailUrl: 'http://google.com/some/image/path.png',
          description: 'Url beginning with http:// and ending with png'
        },
        {
          thumbnailUrl: 'https://google.com/some/image/path.png',
          description: 'Url beginning with https:// and ending with png'
        }
      ])('$description', ({ thumbnailUrl }) => {
        const responseThumbnail = requestAdminQuizThumbnailUpdate(
          quizId,
          session,
          thumbnailUrl
        );
        expect(responseThumbnail.body).toStrictEqual({});
        expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.OK);
      });
    });
  });

  test('Testing PUT /v1/admin/quiz/{quizid}/thumbnail works as intended', () => {
    // Gets the details of the quiz to checks that there's no thumbnail
    let responseQuizDetails = requestGetQuizV2(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: timeCreated,
      timeLastEdited: timeCreated,
      description: 'Description',
      numQuestions: 0,
      questions: [],
      timeLimit: expect.any(Number)
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.OK);
    
    // Adds a thumbnail for the quiz
    let responseThumbnail = requestAdminQuizThumbnailUpdate(
      quizId,
      session,
      'https://google.com/some/image/path.png'
    );
    expect(responseThumbnail.body).toStrictEqual({});
    expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.OK);
    // Gets the current time
    let timeLastEdited = Math.floor(Date.now()/1000);

    // Gets the latest details of the quiz to checks that the thumbnail is there
    responseQuizDetails = requestGetQuizV2(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: timeCreated,
      timeLastEdited: timeLastEdited,
      description: 'Description',
      numQuestions: 0,
      questions: [],
      timeLimit: expect.any(Number),
      thumbnailUrl: 'https://google.com/some/image/path.png'
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.OK);

    // Updates the thumbnail of the quiz
    responseThumbnail = requestAdminQuizThumbnailUpdate(
      quizId,
      session,
      'https://i1.sndcdn.com/artworks-000360728946-bilq7t-t500x500.jpg'
    );
    expect(responseThumbnail.body).toStrictEqual({});
    expect(responseThumbnail.statusCode).toStrictEqual(ErrorCodes.OK);
    timeLastEdited = Math.floor(Date.now()/1000);

    // Checks that the thumbnail is updated
    responseQuizDetails = requestGetQuizV2(quizId, session);
    expect(responseQuizDetails.body).toStrictEqual({
      quizId: quizId,
      name: 'Name',
      timeCreated: timeCreated,
      timeLastEdited: timeLastEdited,
      description: 'Description',
      numQuestions: 0,
      questions: [],
      timeLimit: expect.any(Number),
      thumbnailUrl: 'https://i1.sndcdn.com/artworks-000360728946-bilq7t-t500x500.jpg'
    });
    expect(responseQuizDetails.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});
