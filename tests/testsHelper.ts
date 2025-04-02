import request, { HttpVerb } from 'sync-request-curl';
import config from '../src/config.json';
import { questionsInterface } from '../src/dataStore';

const port = config.port;
const url = config.url;
const serverURL = `${url}:${port}/v1`;
const timeoutMS = 7 * 1000;

/**
 * Interface representing the output of the responses
 * 
 * @typedef {object} responseInterface
 * 
 * @property {any} body - The body of the response
 * @property {number} statusCode - The status code of the response
 */
export interface responseInterface {
  body: any;
  statusCode: number;
}

/**
 * Interface representing the body of a question.
 * 
 * @typedef {object} questionBodyInterface
 * 
 * @property {questionsInterface} questionBody - An object containing all the details in a question
 */
export interface questionBodyInterface {
  questionBody: questionsInterface;
}

/**
 * Helper function to handle common request logic
 * 
 * @param {HttpVerb} method - The type of the route
 * @param {string} endpoint - The url of the route
 * @param {any} [body] - The optional body to send to the route
 * @param {any} [headers] - Optional headers to send to the route
 * 
 * @returns {responseInterface} - The response of the route call
 */
function makeRequest(
  method: HttpVerb,
  endpoint: string,
  body?: any,
  headers?: any
): responseInterface {
  const res = request(
    method,
    `${serverURL}${endpoint}`,
    {
      json: body,
      headers,
      timeout: timeoutMS,
    }
  );
  return {
    statusCode: res.statusCode,
    body: JSON.parse(res.body.toString())
  };
}

/**
 * Wrapper for DELETE /v1/clear
 * 
 * @returns {responseInterface} - The response of the route call
 */
export function requestClear(): responseInterface {
  return makeRequest(
    'DELETE',
    '/clear',
    null,
    null
  );
}

/**
 * Wrapper for DELETE /v1/admin/quiz/{quizid}
 * 
 * @param {number} quizId - ID of the quiz
 * @param {string} session - The session of the user
 * 
 * @returns {responseInterface} - The response of the route call
 */
export function requestDeleteQuiz(
  quizId: number,
  session: string
): responseInterface {
  return makeRequest(
    'DELETE',
    `/admin/quiz/${quizId}`,
    null,
    { session }
  );
}

/**
 * Wrapper for DELETE /v1/admin/quiz/{quizid}/question/{questionid}
 * 
 * @param {number} quizId - ID of the quiz
 * @param {number} questionId - ID of the question
 * @param {string} session - The session of the user
 * 
 * @returns {responseInterface} - The response of the route call
 */
export function requestDeleteQuizQuestion(
  quizId: number,
  questionId: number,
  session: string
): responseInterface {
  return makeRequest(
    'DELETE',
    `/admin/quiz/${quizId}/question/${questionId}`,
    null,
    { session }
  );
}

/**
 * Wrapper for GET /v1/admin/quiz/{quizid}
 * 
 * @param {number} quizId - ID of the quiz
 * @param {string} session - The session of the user
 * 
 * @returns {responseInterface} - The response of the route call
 */
export function requestGetQuiz(
  quizId: number,
  session: string
): responseInterface {
  return makeRequest(
    'GET',
    `/admin/quiz/${quizId}`,
    null,
    { session }
  );
}

// Wrapper for GET /v1/admin/quiz/{quizId}/question/suggestion
export function requestGetQuizQuestionSuggestion(
  quizId: number,
  session: string
): responseInterface {
  return makeRequest(
    'GET',
    `/admin/quiz/${quizId}/question/suggestion`,
    null,
    { session }
  );
}

// Wrapper for GET /v1/admin/quiz/list
export function requestGetQuizList(
  session: string
): responseInterface {
  return makeRequest(
    'GET',
    '/admin/quiz/list',
    null,
    { session }
  );
}

// Wrapper for GET /v1/admin/user/details
export function requestGetUserDetails(
  session: string
): responseInterface {
  return makeRequest(
    'GET',
    '/admin/user/details',
    null,
    { session }
  );
}

// Wrapper for POST /v1/admin/auth/login
export function requestAdminAuthLogin(
  email: string,
  password: string
): responseInterface {
  return makeRequest(
    'POST',
    '/admin/auth/login',
    { email, password }
  );
}

// Wrapper for POST /v1/admin/auth/logout
export function requestAdminAuthLogout(
  session: string
): responseInterface {
  return makeRequest(
    'POST',
    '/admin/auth/logout',
    null,
    { session }
  );
}

// Wrapper for POST /v1/admin/auth/register
export function requestAdminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): responseInterface {
  return makeRequest(
    'POST',
    '/admin/auth/register',
    { email, password, nameFirst, nameLast }
  );
}

// Wrapper for POST /v1/admin/quiz
export function requestAdminQuizCreate(
  session: string,
  name: string,
  description: string
): responseInterface {
  return makeRequest(
    'POST',
    '/admin/quiz',
    { name, description },
    { session }
  );
}

// Wrapper for POST /v1/admin/quiz/{quizid}/question
export function requestAdminQuizQuestionCreate(
  quizId: number,
  session: string,
  questionBody: questionBodyInterface
): responseInterface {
  return makeRequest(
    'POST',
    `/admin/quiz/${quizId}/question`,
    { questionBody },
    { session }
  );
}

// Wrapper for POST /v1/admin/quiz/{quizid}/transfer
export function requestAdminQuizTransfer(
  quizId: number,
  session: string,
  userEmail: string
): responseInterface {
  return makeRequest(
    'POST',
    `/admin/quiz/${quizId}/transfer`,
    { userEmail },
    { session }
  );
}

// Wrapper for PUT /v1/admin/quiz/{quizid}/description
export function requestAdminQuizUpdateDescription(
  quizId: number,
  session: string,
  description: string
): responseInterface {
  return makeRequest(
    'PUT',
    `/admin/quiz/${quizId}/description`,
    { description },
    { session }
  );
}

// Wrapper for PUT /v1/admin/quiz/{quizid}/name
export function requestAdminQuizUpdateName(
  quizId: number,
  session: string,
  name: string
): responseInterface {
  return makeRequest(
    'PUT',
    `/admin/quiz/${quizId}/name`,
    { name },
    { session }
  );
}

// Wrapper for PUT /v1/admin/quiz/{quizid}/question/{questionid}
export function requestAdminQuizQuestionUpdate(
  quizId: number,
  questionId: number,
  session: string,
  questionBody: questionBodyInterface
): responseInterface {
  return makeRequest(
    'PUT',
    `/admin/quiz/${quizId}/question/${questionId}`,
    { questionBody },
    { session }
  );
}

// Wrapper for PUT /v1/admin/quiz/{quizid}/question/{questionid}/move
export function requestAdminQuizQuestionMove(
  quizId: number,
  questionId: number,
  session: string,
  newPosition: number
): responseInterface {
  return makeRequest(
    'PUT',
    `/admin/quiz/${quizId}/question/${questionId}/move`,
    { newPosition },
    { session }
  );
}

// Wrapper for PUT /v1/admin/user/details
export function requestAdminUserDetailsUpdate(
  session: string,
  email: string,
  nameFirst: string,
  nameLast: string
): responseInterface {
  return makeRequest(
    'PUT',
    '/admin/user/details',
    { email, nameFirst, nameLast },
    { session }
  );
}

// Wrapper for PUT /v1/admin/user/password
export function requestAdminUserPasswordUpdate(
  session: string,
  oldPassword: string,
  newPassword: string
): responseInterface {
  return makeRequest(
    'PUT',
    '/admin/user/password',
    { oldPassword, newPassword },
    { session }
  );
}
