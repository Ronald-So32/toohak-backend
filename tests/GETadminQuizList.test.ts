import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let id: number;
let quizId, quizId2, quizId3;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/clear', { timeout: TIMEOUT_MS });
  const registerUser = request('PUT', SERVER_URL + '/v1/admin/auth/register', 
    { json: { email: 'email@email.com', password: 'password1', nameFirst: 'First', nameLast: 'Last' }, 
    timeout: TIMEOUT_MS }); 
  id = parseInt(JSON.parse(registerUser.body.toString()));

  const createQuiz = request('POST', SERVER_URL + '/v1/admin/quiz', 
    { json: { quizId: id, quizName: 'Quiz name', description: 'Description' }, timeout: TIMEOUT_MS });
  quizId = parseInt(JSON.parse(createQuiz.body.toString()));
});


describe('Tests for quiz list', () => {
  test('User Id invalid', () => {
    const res =  request('POST', SERVER_URL + '/v1/admin/quiz/list', 
      { json: { userId: id + 999 }, timeout: TIMEOUT_MS });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(JSON.parse(res.body.toString())).not.toBeNull();
    expect(res.statusCode).toStrictEqual(400);
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



