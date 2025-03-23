import request from 'sync-request-curl';
import { port, url } from '../src/config.json';
import {
  requestClear,
  requestDeleteQuiz,
  requestGetQuizList,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
} from 'helper.ts'
// don't know how to import properly

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let session: string;
let quizId: number
let quizId2: number
let quizId3: number

beforeEach(() => {
  requestClear()
  const res = requestAdminAuthRegister('email@email.com', 'password1', 'First', 'Last');
  session = res.body.session;

  const quizRes = requestAdminQuizCreate(session, 'Quiz name', 'Description');
  quizId = res.body.quizId;
});


describe('Tests for quiz list', () => {
  // Is the 401 case correct?
  // Session is empty or invalid (does not refer to valid logged in user session)
  test('User Id invalid', () => {
    const invalidOffset = JSON.parse(999.toString())
    const res = requestGetQuizList(session + 999);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.body).not.toBeNull();
    expect(res.statusCode).toStrictEqual(401);
  });

  test('User Id valid', () => {
    const res =  request('POST', SERVER_URL + '/v1/admin/quiz/list', 
      { json: { userId: id }, timeout: TIMEOUT_MS });
    expect(typeof JSON.parse(res.body.toString())).toBe('object');
    expect(JSON.parse(res.body.toString())).toStrictEqual({ 
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz name',
        }
      ]
    });
    expect(JSON.parse(res.body.toString())).not.toBeNull();
    expect(res.statusCode).toStrictEqual(200);
  });
});


describe('Valid User Id with multiple quizzes', () => {
  test('User Id valid', () => {
    // create quiz 2 
    const quiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', 
      { json: { userId: id, quizName: 'Quiz2 name', description: 'Description2' }, timeout: TIMEOUT_MS });
    // create quiz 3
    const quiz3 = request('POST', SERVER_URL + '/v1/admin/quiz', 
      { json: { userIdId: id, quizName: 'Quiz3 name', description: 'Description3' }, timeout: TIMEOUT_MS });
    // get quizId of quiz 2
    quizId2 = parseInt(JSON.parse(quiz2.body.toString()));
    // get quizId of quiz 3
    quizId3 = parseInt(JSON.parse(quiz3.body.toString()));
    const res =  request('POST', SERVER_URL + '/v1/admin/quiz/list', 
      { json: { userId: id }, timeout: TIMEOUT_MS });
    expect(typeof JSON.parse(res.body.toString())).toBe('object');
    expect(JSON.parse(res.body.toString())).toStrictEqual({ 
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz name',
        },
        {
          quizId: quizId2,
          name: 'Quiz2 name',
        },
        {
          quizId: quizId3,
          name: 'Quiz3 name',
        },
      ]
    });
    expect(JSON.parse(res.body.toString())).not.toBeNull();
    expect(res.statusCode).toStrictEqual(200);
  });
});


describe('Valid User Id with multiple quizzes after removal', () => {
  test('User Id valid', () => {
    const quiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', 
      { json: { userId: id, quizName: 'Quiz2 name', description: 'Description2' }, timeout: TIMEOUT_MS });
    const quiz3 = request('POST', SERVER_URL + '/v1/admin/quiz', 
      { json: { userIdId: id, quizName: 'Quiz3 name', description: 'Description3' }, timeout: TIMEOUT_MS });
    quizId2 = parseInt(JSON.parse(quiz2.body.toString()));
    quizId3 = parseInt(JSON.parse(quiz3.body.toString()));
    const res =  request('POST', SERVER_URL + '/v1/admin/quiz/list', 
      { json: { userId: id }, timeout: TIMEOUT_MS });
    // Removes Quiz 2 from the data
    request('DELETE', SERVER_URL + '/v1/admin/quiz/{quizid}', 
      { json: { userId: id, quizId: quizId2 }, timeout: TIMEOUT_MS });

    // To make sure that Quiz 2 doesn't exist in the list
    expect(typeof JSON.parse(res.body.toString())).toBe('object');
    expect(JSON.parse(res.body.toString())).toStrictEqual({ 
      quizzes: [
        {
          quizId: quizId,
          name: 'Quiz name',
        },
        {
          quizId: quizId3,
          name: 'Quiz3 name',
        },
      ]
    });
    expect(JSON.parse(res.body.toString())).not.toBeNull();
    expect(res.statusCode).toStrictEqual(200);
  });
});





