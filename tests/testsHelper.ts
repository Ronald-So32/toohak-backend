import request, { HttpVerb } from 'sync-request-curl';
import config from '../src/config.json';
import { questionsInterface } from '../src/dataStore';

const port = config.port;
const url = config.url;
const serverURL = `${url}:${port}`;
const timeoutMS = 7 * 1000;

export const OK: number = 200;
export const BADREQUEST: number = 400;
export const UNAUTHORISED: number = 401;
export const FORBIDDEN: number = 403;

export const quizIdOffset: number = 727;
export const questionIdOffset: number = 727;

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
    '/v1/clear',
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
    `/v1/admin/quiz/${quizId}`,
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
    `/v1/admin/quiz/${quizId}/question/${questionId}`,
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
    `/v1/admin/quiz/${quizId}`,
    null,
    { session }
  );
}

/**
 * Wrapper for GET /v1/admin/quiz/{quizId}/question/suggestion
 *
 * @param {number} quizId - ID of the quiz
 * @param {string} session - The session of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestGetQuizQuestionSuggestion(
  quizId: number,
  session: string
): responseInterface {
  return makeRequest(
    'GET',
    `/v1/admin/quiz/${quizId}/question/suggestion`,
    null,
    { session }
  );
}

/**
 * Wrapper for GET /v1/admin/quiz/list
 *
 * @param {string} session - The session of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestGetQuizList(
  session: string
): responseInterface {
  return makeRequest(
    'GET',
    '/v1/admin/quiz/list',
    null,
    { session }
  );
}

/**
 * Wrapper for GET /v1/admin/user/details
 *
 * @param {string} session - The session of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestGetUserDetails(
  session: string
): responseInterface {
  return makeRequest(
    'GET',
    '/v1/admin/user/details',
    null,
    { session }
  );
}

/**
 * Wrapper for POST /v1/admin/auth/login
 *
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminAuthLogin(
  email: string,
  password: string
): responseInterface {
  return makeRequest(
    'POST',
    '/v1/admin/auth/login',
    { email, password }
  );
}

/**
 * Wrapper for POST /v1/admin/auth/logout
 *
 * @param {string} session - The session of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminAuthLogout(
  session: string
): responseInterface {
  return makeRequest(
    'POST',
    '/v1/admin/auth/logout',
    null,
    { session }
  );
}

/**
 * Wrapper for POST /v1/admin/auth/register
 *
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @param {string} nameFirst - The first name of the user
 * @param {string} nameLast - The last name of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): responseInterface {
  return makeRequest(
    'POST',
    '/v1/admin/auth/register',
    { email, password, nameFirst, nameLast }
  );
}

/**
 * Wrapper for POST /v1/admin/quiz
 *
 * @param {string} session - The session of the user
 * @param {string} name - The name of the quiz
 * @param {string} description - The description of the quiz
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminQuizCreate(
  session: string,
  name: string,
  description: string
): responseInterface {
  return makeRequest(
    'POST',
    '/v1/admin/quiz',
    { name, description },
    { session }
  );
}

/**
 * Wrapper for POST /v1/admin/quiz/{quizid}/question
 *
 * @param {number} quizId - ID of the quiz
 * @param {string} session - The session of the user
 * @param {questionBodyInterface} questionBody - The details of the question
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminQuizQuestionCreate(
  quizId: number,
  session: string,
  questionBody: questionBodyInterface
): responseInterface {
  return makeRequest(
    'POST',
    `/v1/admin/quiz/${quizId}/question`,
    questionBody,
    { session }
  );
}

/**
 * Wrapper for POST /v1/admin/quiz/{quizid}/transfer
 *
 * @param {number} quizId - ID of the quiz
 * @param {string} session - The session of the user
 * @param {string} userEmail - The email of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminQuizTransfer(
  quizId: number,
  session: string,
  userEmail: string
): responseInterface {
  return makeRequest(
    'POST',
    `/v1/admin/quiz/${quizId}/transfer`,
    { userEmail },
    { session }
  );
}

/**
 * Wrapper for PUT /v1/admin/quiz/{quizid}/description
 *
 * @param {number} quizId - ID of the quiz
 * @param {string} session - The session of the user
 * @param {string} description - The description of the quiz
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminQuizUpdateDescription(
  quizId: number,
  session: string,
  description: string
): responseInterface {
  return makeRequest(
    'PUT',
    `/v1/admin/quiz/${quizId}/description`,
    { description },
    { session }
  );
}

/**
 * Wrapper for PUT /v1/admin/quiz/{quizid}/name
 *
 * @param {number} quizId - ID of the quiz
 * @param {string} session - The session of the user
 * @param {string} name - The name of the quiz
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminQuizUpdateName(
  quizId: number,
  session: string,
  name: string
): responseInterface {
  return makeRequest(
    'PUT',
    `/v1/admin/quiz/${quizId}/name`,
    { name },
    { session }
  );
}

/**
 * Wrapper for PUT /v1/admin/quiz/{quizid}/question/{questionid}
 *
 * @param {number} quizId - ID of the quiz
 * @param {number} questionId - ID of the question
 * @param {string} session - The session of the user
 * @param {questionBodyInterface} questionBody - The details of the question
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminQuizQuestionUpdate(
  quizId: number,
  questionId: number,
  session: string,
  questionBody: questionBodyInterface
): responseInterface {
  return makeRequest(
    'PUT',
    `/v1/admin/quiz/${quizId}/question/${questionId}`,
    questionBody,
    { session }
  );
}

/**
 * Wrapper for PUT /v1/admin/quiz/{quizid}/question/{questionid}/move
 *
 * @param {number} quizId - ID of the quiz
 * @param {number} questionId - ID of the question
 * @param {string} session - The session of the user
 * @param {number} newPosition - The new position of the question
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminQuizQuestionMove(
  quizId: number,
  questionId: number,
  session: string,
  newPosition: number
): responseInterface {
  return makeRequest(
    'PUT',
    `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    { newPosition },
    { session }
  );
}

/**
 * Wrapper for PUT /v1/admin/user/details
 *
 * @param {string} session - The session of the user
 * @param {string} email - The email of the user
 * @param {string} nameFirst - The first name of the user
 * @param {string} nameLast - The last name of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminUserDetailsUpdate(
  session: string,
  email: string,
  nameFirst: string,
  nameLast: string
): responseInterface {
  return makeRequest(
    'PUT',
    '/v1/admin/user/details',
    { email, nameFirst, nameLast },
    { session }
  );
}

/**
 * Wrapper for PUT /v1/admin/user/password
 *
 * @param {string} session - The session of the user
 * @param {string} oldPassword - The old password of the user
 * @param {string} newPassword - The new password of the user
 *
 * @returns {responseInterface} - The response of the route call
 */
export function requestAdminUserPasswordUpdate(
  session: string,
  oldPassword: string,
  newPassword: string
): responseInterface {
  return makeRequest(
    'PUT',
    '/v1/admin/user/password',
    { oldPassword, newPassword },
    { session }
  );
}

/**
 * Wrapper for DELETE /v2/admin/quiz/{quizid}
 */
export function requestDeleteQuizV2(
  quizId: number,
  session: string
): responseInterface {
  return makeRequest(
    'DELETE',
    `/v2/admin/quiz/${quizId}`,
    null,
    { session }
  );
}

/**
 * Wrapper for GET /v2/admin/quiz/{quizid}
 */
export function requestGetQuizV2(
  quizId: number,
  session: string
): responseInterface {
  return makeRequest(
    'GET',
    `/v2/admin/quiz/${quizId}`,
    null,
    { session }
  );
}

/**
 * Wrapper for POST /v2/admin/quiz/{quizid}/transfer
 */
export function requestAdminQuizTransferV2(
  quizId: number,
  session: string,
  userEmail: string
): responseInterface {
  return makeRequest(
    'POST',
    `/v2/admin/quiz/${quizId}/transfer`,
    { userEmail },
    { session }
  );
}

/**
 * Wrapper for POST /v2/admin/quiz/{quizid}/question
 */
export function requestAdminQuizQuestionCreateV2(
  quizId: number,
  session: string,
  questionBody: questionBodyInterface
): responseInterface {
  return makeRequest(
    'POST',
    `/v2/admin/quiz/${quizId}/question`,
    questionBody,
    { session }
  );
}

/**
 * Wrapper for PUT /v2/admin/quiz/{quizid}/question/{questionid}
 */
export function requestAdminQuizQuestionUpdateV2(
  quizId: number,
  questionId: number,
  session: string,
  questionBody: questionBodyInterface
): responseInterface {
  return makeRequest(
    'PUT',
    `/v2/admin/quiz/${quizId}/question/${questionId}`,
    questionBody,
    { session }
  );
}

/**
 * Wrapper for DELETE /v2/admin/quiz/{quizid}/question/{questionid}
 */
export function requestDeleteQuizQuestionV2(
  quizId: number,
  questionId: number,
  session: string
): responseInterface {
  return makeRequest(
    'DELETE',
    `/v2/admin/quiz/${quizId}/question/${questionId}`,
    null,
    { session }
  );
}

/**
 * Wrapper for PUT /v1/admin/quiz/{quizid}/thumbnail
 */
export function requestAdminQuizThumbnailUpdate(
  quizId: number,
  session: string,
  thumbnailUrl: string
): responseInterface {
  return makeRequest(
    'PUT',
    `/v1/admin/quiz/${quizId}/thumbnail`,
    { thumbnailUrl },
    { session }
  );
}

/**
 * Wrapper for GET /v1/admin/quiz/{quizid}/games
 */
export function requestAdminQuizGamesList(
  session: string,
  quizId: number
): responseInterface {
  return makeRequest(
    'GET',
    `/v1/admin/quiz/${quizId}/games`,
    null,
    { session }
  );
}

/**
 * Wrapper for POST /v1/admin/quiz/{quizid}/game/start
 */
export function requestAdminQuizGameStart(
  session: string,
  quizId: number,
  autoStartNum: number
): responseInterface {
  return makeRequest(
    'POST',
    `/v1/admin/quiz/${quizId}/game/start`,
    { autoStartNum },
    { session }
  );
}

/**
 * Wrapper for PUT /v1/admin/quiz/{quizid}/game/{gameid}
 */
export function requestAdminQuizGameStateUpdate(
  session: string,
  quizId: number,
  gameId: number,
  action: string
): responseInterface {
  return makeRequest(
    'PUT',
    `/v1/admin/quiz/${quizId}/game/${gameId}`,
    { action },
    { session }
  );
}

/**
 * Wrapper for GET /v1/admin/quiz/{quizid}/game/{gameid}
 */
export function requestAdminQuizGameStatus(
  session: string,
  quizId: number,
  gameId: number
): responseInterface {
  return makeRequest(
    'GET',
    `/v1/admin/quiz/${quizId}/game/${gameId}`,
    null,
    { session }
  );
}

/**
 * Wrapper for GET /v1/admin/quiz/{quizid}/game/{gameid}/results
 */
export function requestAdminQuizGameResults(
  session: string,
  quizId: number,
  gameId: number
): responseInterface {
  return makeRequest(
    'GET',
    `/v1/admin/quiz/${quizId}/game/${gameId}/results`,
    null,
    { session }
  );
}

/**
 * Wrapper for POST /v1/player/join
 */
export function requestPlayerJoin(
  gameId: number,
  playerName: string
): responseInterface {
  return makeRequest(
    'POST',
    '/v1/player/join',
    { gameId, playerName }
  );
}

/**
 * Wrapper for GET /v1/player/{playerid}
 */
export function requestPlayerStatus(
  playerId: number
): responseInterface {
  return makeRequest(
    'GET',
    `/v1/player/${playerId}`
  );
}

/**
 * Wrapper for GET /v1/player/{playerid}/question/{questionposition}
 */
export function requestPlayerQuestionInfo(
  playerId: number,
  questionPosition: number
): responseInterface {
  return makeRequest(
    'GET',
    `/v1/player/${playerId}/question/${questionPosition}`
  );
}

/**
 * Wrapper for PUT /v1/player/{playerid}/question/{questionposition}/answer
 */
export function requestPlayerAnswerSubmit(
  playerId: number,
  questionPosition: number,
  answerIds: number[]
): responseInterface {
  return makeRequest(
    'PUT',
    `/v1/player/${playerId}/question/${questionPosition}/answer`,
    { answerIds }
  );
}

/**
 * Wrapper for GET /v1/player/{playerid}/question/{questionposition}/results
 */
export function requestPlayerQuestionResults(
  playerId: number,
  questionPosition: number
): responseInterface {
  return makeRequest(
    'GET',
    `/v1/player/${playerId}/question/${questionPosition}/results`
  );
}

/**
 * Wrapper for GET /v1/player/{playerid}/results
 */
export function requestPlayerFinalResults(
  playerId: number
): responseInterface {
  return makeRequest(
    'GET',
    `/v1/player/${playerId}/results`
  );
}
