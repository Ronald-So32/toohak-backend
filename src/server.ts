import { clear } from './other';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
  adminAuthLogout,
} from './auth';
import {
  adminQuizList,
  adminQuizRemove,
  adminQuizRemoveV2,
  adminQuizCreate,
  adminQuizGet,
  adminQuizGetV2,
  adminQuizQuestionCreate,
  adminQuizQuestionCreateV2,
  adminQuizDescriptionUpdate,
  adminQuizNameUpdate,
  adminQuizTransfer,
  adminQuizTransferV2,
  adminQuizQuestionUpdate,
  adminQuizQuestionUpdateV2,
  adminQuizQuestionMove,
  adminDeleteQuizQuestion,
  adminDeleteQuizQuestionV2,
  adminQuizQuestionSuggestion,
  adminQuizThumbnailUpdate
} from './quiz';
import {
  adminQuizGameStart,
  adminGetQuizGames,
  adminQuizGameUpdate,
  adminQuizGameStatus,
  adminQuizGameResults,
  playerJoin,
  playerStatus,
  playerQuestion,
  playerQuestionResults,
  playerFinalResults,
  playerAnswerSubmit
} from './player';
import {
  createCSV,
  exportJSON,
  importJSON,
  attachments,
  seeAttachments,
  hint,
  translate,
  explain
} from './openEnded';
import { findUserIdFromSession } from './functionsHelper';
import { getData } from './dataStore';

import express, {
  json,
  Request,
  Response
} from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import fs from 'fs';
import process from 'process';

const OK = 200;

const HUGGINGFACE_API_TOKEN = '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';
const DB_PATH = './DATABASE.json';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// For logging errors (print to terminal)
app.use(morgan('dev'));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

/**
 * Save the current state of the data into the json file
 *
 * @returns {Record<string, never>}
 */
export function save(): void {
  console.log(`Updating ${DB_PATH}`);
  const jsonData = JSON.stringify(getData(), null, 2);
  fs.writeFileSync(DB_PATH, jsonData);
}

/**
 * Load data from whatever is stored in the json file
 *
 * @returns {Record<string, never>}
 */
export function load(): void {
  const data = getData();
  if (fs.existsSync(DB_PATH)) {
    console.log(`Loading data from ${DB_PATH}`);
    const jsonData = fs.readFileSync(DB_PATH).toString();
    const dataStore = JSON.parse(jsonData);
    Object.assign(data, dataStore);
  }
}

/**
 * Example get request
 *
 * @returns {object} - JSON object with echoed string or an error message
 */
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400); // PLS don't mark us down for this route
  }

  return res.json(result);
});

/**
 * DELETE /v1/clear route
 *
 * Clears all stored data on server
 *
 * @returns {object} - Returns empty JSON object with status 200 on success
 */
app.delete('/v1/clear', (req: Request, res: Response) => {
  clear();

  return res.status(OK).json({});
});

/**
 * POST /v1/admin/auth/register
 *
 * Registers new admin user with given email, password, first name, and last name
 * On successful registration, returns session token
 *
 * Request Body:
 * - email: string — User's email address
 * - password: string — User's password
 * - nameFirst: string — User's first name
 * - nameLast: string — User's last name
 *
 * @returns {object} - Return reuslt on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  try {
    const result = adminAuthRegister(email, password, nameFirst, nameLast);

    return res.status(OK).json({ session: result.session });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v1/admin/auth/login route
 *
 * Check an user using the provided email and password
 * If valid, return a session token
 *
 * Request Body:
 * - email: string — user's email address
 * - password: string — user's password
 *
 * @returns {object} - Return result object on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = adminAuthLogin(email, password);

    return res.status(OK).json({ session: result.session });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/admin/user/details route
 *
 * Retrieves details of the currently logged-in user using session
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * @returns {object} - Return user details on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const session = req.headers.session as string;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    const result = adminUserDetails(userId);

    return res.status(OK).json({ user: result.user });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/user/details route
 *
 * Updates details: email, first name, last name of currently logged-in user.
 *
 * Request Headers:
 * - session: string — Session token identifying user
 *
 * Request Body:
 * - email: string — New email address for the user
 * - nameFirst: string — New first name
 * - nameLast: string — New last name
 *
 * @returns {Record<string, never>} - Returns nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const { email, nameFirst, nameLast } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminUserDetailsUpdate(userId, email, nameFirst, nameLast);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/user/password route
 *
 * Update password of user
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * Request Body:
 * - oldPassword: string — The user's current password
 * - newPassword: string — New password
 *
 * @returns {Record<string, never>} - Returns empty object on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const { oldPassword, newPassword } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminUserPasswordUpdate(userId, oldPassword, newPassword);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v1/admin/quiz route
 *
 * Creates new quiz for a user
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * Request Body:
 * - name: string — Name of quiz
 * - description: string — Description of quiz
 *
 * @returns {object} - Return quizId on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const { name, description } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    const result = adminQuizCreate(userId, name, description);

    return res.status(OK).json({ quizId: result.quizId });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/admin/quiz/list route
 *
 * Get list of all quizzes created by the currently authenticated admin user
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * @returns {object} - Return quiz list on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const session = req.headers.session as string;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    const result = adminQuizList(userId);

    return res.status(OK).json({ quizzes: result.quizzes });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /v1/admin/quiz/:quizid route
 *
 * Deletes quiz with quizId
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * Request Params:
 * - quizid: number — ID of the quiz to be deleted
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizRemove(userId, quizId);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /v2/admin/quiz/:quizid route
 *
 * Deletes quiz with quizId
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * Request Params:
 * - quizid: number — ID of the quiz to be deleted
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizRemoveV2(userId, quizId);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/admin/quiz/:quizid route
 *
 * Get information of a quiz
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * Request Params:
 * - quizid: number — ID of the quiz to retrieve
 *
 * @returns {object} - Returns result upon success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    const result = adminQuizGet(userId, quizId);

    return res.status(OK).json(result.details);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v2/admin/quiz/:quizid route
 *
 * Get information of a quiz
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * Request Params:
 * - quizid: number — ID of the quiz to retrieve
 *
 * @returns {object} - Returns result upon success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    const result = adminQuizGetV2(userId, quizId);

    return res.status(OK).json(result.details);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v1/admin/quiz/:quizid/question route
 *
 * Creates a new question within a in quiz with given quizId
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * Request Params:
 * - quizid: number — ID of the quiz where question will be added
 *
 * Request Body:
 * - questionBody: object — Quesiton details
 *
 * @returns {object} - { questionId: number } on successful creation
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { questionBody } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizGet(userId, quizId);
    const result = adminQuizQuestionCreate(userId, quizId, questionBody);

    return res.status(OK).json({ questionId: result.questionId });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v2/admin/quiz/:quizid/question route
 *
 * Creates a new question within a in quiz with given quizId
 *
 * Request Headers:
 * - session: string — Session token identifying the user
 *
 * Request Params:
 * - quizid: number — ID of the quiz where question will be added
 *
 * Request Body:
 * - questionBody: object — Quesiton details
 *
 * @returns {object} - { questionId: number } on successful creation
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { questionBody } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizGet(userId, quizId);
    const result = adminQuizQuestionCreateV2(userId, quizId, questionBody);

    return res.status(OK).json({ questionId: result.questionId });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/quiz/:quizid/name route
 *
 * Updates the name of a specified quiz
 *
 * Request Headers:
 * - session: string — Authenticated user's session token
 *
 * Request Params:
 * - quizid: number — ID of the quiz to be updated
 *
 * Request Body:
 * - name: string — New name for the quiz
 *
 * @returns {Record<string, never>} - Return nothing upon success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { name } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizNameUpdate(userId, quizId, name);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/quiz/:quizid/description route
 *
 * Updates the description of a specified quiz with given quizId
 *
 * Request Headers:
 * - session: string — Authenticated user's session token
 *
 * Request Params:
 * - quizid: number — ID of the quiz to update
 *
 * Request Body:
 * - description: string — New description for the quiz
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with an associated status code
 */
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { description } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizDescriptionUpdate(userId, quizId, description);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v1/admin/auth/logout route
 *
 * Logs out given user
 *
 * Request Headers:
 * - session: string — The session token of the user to be logged out
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with an appropriate status code
 */
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const session = req.headers.session as string;

  try {
    adminAuthLogout(session);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v1/admin/quiz/:quizid/transfer route
 *
 * Transfers ownership of a quiz to another based on email
 *
 * Request Headers:
 * - session: string — The session token of the current quiz owner
 *
 * Request Body:
 * - userEmail: string — Email address of new owner
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz to transfer
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { userEmail } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizTransfer(quizId, userId, userEmail);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v2/admin/quiz/:quizid/transfer route
 *
 * Transfers ownership of a quiz to another based on email
 *
 * Request Headers:
 * - session: string — The session token of the current quiz owner
 *
 * Request Body:
 * - userEmail: string — Email address of new owner
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz to transfer
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { userEmail } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizTransferV2(quizId, userId, userEmail);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/quiz/:quizid/question/:questionid route
 *
 * Updates question with given questionid
 *
 * Request Headers:
 * - session: string — Session token of the current quiz owner
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz
 * - questionid: number — ID of the question to update
 *
 * Request Body:
 * - questionBody: object — Updated question content
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { questionBody } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizGet(userId, quizId);
    adminQuizQuestionUpdate(userId, quizId, questionId, questionBody);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v2/admin/quiz/:quizid/question/:questionid route
 *
 * Updates question with given questionid
 *
 * Request Headers:
 * - session: string — Session token of the current quiz owner
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz
 * - questionid: number — ID of the question to update
 *
 * Request Body:
 * - questionBody: object — Updated question content
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { questionBody } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizGet(userId, quizId);
    adminQuizQuestionUpdateV2(userId, quizId, questionId, questionBody);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /v1/admin/quiz/:quizid/question/:questionid route
 *
 * Deletes question with questionid
 *
 * Request Headers:
 * - session: string — The session token of the current user
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz with question to be deleted
 * - questionid: number — ID of the question to delete
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminDeleteQuizQuestion(quizId, userId, questionId);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /v2/admin/quiz/:quizid/question/:questionid route
 *
 * Deletes question with questionid
 *
 * Request Headers:
 * - session: string — The session token of the current user
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz with question to be deleted
 * - questionid: number — ID of the question to delete
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminDeleteQuizQuestionV2(quizId, userId, questionId);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/quiz/:quizid/question/:questionid/move route
 *
 * Moves question in a quiz to a new position in the question order
 *
 * Request Headers:
 * - session: string — The session token of currently logged-in user
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz containing the question
 * - questionid: number — ID of the question to move
 *
 * Request Body:
 * - newPosition: number — New position index to move the question to
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { newPosition } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizQuestionMove(quizId, userId, questionId, newPosition);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/admin/quiz/:quizid/question/suggestion route
 *
 * Generate a suggested question based on the quiz's name and description
 *
 * Request Headers:
 * - session: string — Session token of the currently logged-in user
 *
 * Path Parameters:
 * - quizid: number — ID of quiz to generate a suggestion for
 *
 * @returns {object} - Return reuslt upon success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/admin/quiz/:quizid/question/suggestion',
  (req: Request, res: Response) => {
    const session = req.headers.session as string;
    const quizId = parseInt(req.params.quizid);

    try {
    // Authenticate the user with the session
      const userIdResult = findUserIdFromSession(session);
      const userId = userIdResult.userId;

      // Get the quiz details to use in the prompt
      const quizDetailsResult = adminQuizGet(userId, quizId);
      const result = adminQuizQuestionSuggestion(
        quizDetailsResult.details.name,
        quizDetailsResult.details.description,
        HUGGINGFACE_API_TOKEN
      );

      return res.status(OK).json({ question: result.question });
    } catch (error) {
    // This is a BADREQUEST error (not in specs but good for debugging when llm api not working)
      return res.status(error.statusCode).json({ error: error.message });
    }
  });

/**
 * GET /v1/admin/quiz/:quizid/games route
 *
 * Get list of all games in given quiz
 *
 * Request Headers:
 * - session: string — Session token of the currently logged-in user
 *
 * Path Parameters:
 * - quizid: number — ID of quiz to get games list from
 *
 * @returns {object} - Return games
 * @returns {object} - { error: string } on failure, and associated status code
 */
app.get('/v1/admin/quiz/:quizid/games', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  try {
    // Authenticate the user with the session
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;

    // Verify that the user owns the quiz
    adminQuizGet(userId, quizId);

    // Retrieve games associated with the quiz
    const games = adminGetQuizGames(userId, quizId);

    return res.status(OK).json(games);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v1/admin/quiz/:quizid/game/start route
 *
 * Start a new game in given quiz
 *
 * Request Headers:
 * - session: string — Session token of the currently logged-in user
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz where game is being started in
 *
 * Request Body:
 * - autoStartNum: number — Number of players required to automatically start the game
 *
 * @returns {object} - Return gameId on success
 * @returns {object} - { error: string } on failure, and associated status code
 */

app.post('/v1/admin/quiz/:quizid/game/start', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { autoStartNum } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizGet(userId, quizId);
    const result = adminQuizGameStart(userId, quizId, autoStartNum);

    return res.status(OK).json({ gameId: result.gameId });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/quiz/:quizid/thumbnail route
 *
 * Updates the thumbnail URL in given quiz
 *
 * Request Headers:
 * - session: string — Session token of the currently logged-in user
 *
 * Path Parameters:
 * - quizid: number — ID of quiz to update
 *
 * Request Body:
 * - thumbnailUrl: string — New thumbnail for quiz
 *
 * @returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { thumbnailUrl } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;

    // Verify user owns the quiz by calling adminQuizGet
    adminQuizGet(userId, quizId);

    // Call function to update the quiz's thumbnail
    adminQuizThumbnailUpdate(thumbnailUrl, quizId, userId);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/admin/quiz/:quizid/game/:gameid route
 *
 * Get details of the game with gamid in quiz with quizid
 *
 * Request Headers:
 * - session: string — Session token of the currently logged-in user
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz the game belongs to
 * - gameid: number — ID of the game
 *
 * @returns {object} - Returns reuslt upon success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/admin/quiz/:quizid/game/:gameid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const gameId = parseInt(req.params.gameid);

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizGet(userId, quizId);
    const result = adminQuizGameStatus(userId, quizId, gameId);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/admin/quiz/:quizid/game/:gameid route
 *
 * Update the state of a specific game in quiz with given quizId
 *
 * Request Headers:
 * - session: string — Session token of the currently logged-in user
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz the game belongs to
 * - gameid: number — ID of the game to update
 *
 * Request Body:
 * - action: string — action for changing game state
 *
 *@returns {Record<string, never>} - Return nothing on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/admin/quiz/:quizid/game/:gameid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const gameId = parseInt(req.params.gameid);
  const { action } = req.body;

  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizGet(userId, quizId);
    adminQuizGameUpdate(userId, quizId, gameId, action);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/admin/quiz/:quizid/game/:gameid/results route
 *
 * Get final reuslts of game with given gameId
 *
 * Request Headers:
 * - session: string — Session token of the logged-in user
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz
 * - gameid: number — ID of the game
 *
 * @returns {object} - Returns result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/admin/quiz/:quizid/game/:gameid/results', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const gameId = parseInt(req.params.gameid);

  try {
    // Authenticate the user with the session
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;

    // Get the quiz details to use in the prompt
    const result = adminQuizGameResults(userId, quizId, gameId);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * POST /v1/player/join route
 *
 * Allow player to join
 *
 * Request Body:
 * - gameId: number — The ID of the game to join
 * - playerName: string — The name of the player joining the game
 *
 * @returns {object} - Return playerId on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.post('/v1/player/join', (req: Request, res: Response) => {
  const { gameId, playerName } = req.body;

  try {
    const result = playerJoin(gameId, playerName);

    return res.status(OK).json({ playerId: result.playerId });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/player/:playerid route
 *
 * Retrieves the current game status for the specified player
 *
 * Path Parameters:
 * - playerid: number — ID of the player whose game status is being retrieved
 *
 * @returns {object} - Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  try {
    const result = playerStatus(playerId);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/player/:playerid/question/:questionposition route
 *
 * Get information for a question
 *
 * Path Parameters:
 * - playerid: number — ID of the player
 * - questionposition: number — Index of the question quiz
 *
 * @returns {object} - Return reuslt on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);

  try {
    const result = playerQuestion(playerId, questionPosition);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/player/:playerid/question/:questionposition/results route
 *
 * Get reuslts for a quesiton
 *
 * Path Parameters:
 * - playerid: number — ID of the player
 * - questionposition: number — Index of the question in the quiz (1-based)
 *
 * @returns {object} -Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/player/:playerid/question/:questionposition/results',
  (req: Request, res: Response) => {
    const playerId = parseInt(req.params.playerid);
    const questionPosition = parseInt(req.params.questionposition);

    try {
      const result = playerQuestionResults(playerId, questionPosition);
      return res.status(OK).json(result);
    } catch (error) {
      return res.status(error.statusCode).json({ error: error.message });
    }
  });

/**
 * GET /v1/player/{playerid}/results route
 *
 * Get final results for a player after a quiz has ended.
 *
 * @param {number} playerid - The unique ID of the player
 *
 * @returns {object} - Return reuslt upon success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  try {
    const result = playerFinalResults(playerId);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/player/:playerid/question/:questionposition/answer route
 *
 * Submits a player's answer
 *
 * Path Parameters:
 * - playerid: number — ID of the player
 * - questionposition: number — The position/index of the question
 *
 * Request Body:
 * - answerIds: string[] — Array of submitted answer IDs
 *
 * @returns {object} - Return result object upon success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/player/:playerid/question/:questionposition/answer',
  (req: Request, res: Response) => {
    const playerId = parseInt(req.params.playerid);
    const questionPosition = parseInt(req.params.questionposition);
    const answerIds = req.body.answerIds;

    try {
      const result = playerAnswerSubmit(playerId, questionPosition, answerIds);

      return res.status(OK).json(result);
    } catch (error) {
      return res.status(error.statusCode).json({ error: error.message });
    }
  });

/**
 * GET /v1/open/csv/:quizid/:playerid route
 *
 *
 * Path Parameters:
 * - quizid: number — The ID of the quiz
 * - playerid: number — The ID of the player
 *
 * Request Headers:
 * - session: string — Session token for user authentication
 *
 * @returns {object} - Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/open/csv/:quizid/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  try {
    const userId = findUserIdFromSession(session).userId;
    const result = createCSV(playerId, quizId, userId);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/open/export/:quizid route
 *
 * Path Parameters:
 * - quizid: number — The ID of the quiz
 *
 * Request Headers:
 * - session: string — Session token for user authentication
 *
 * @returns {object} - Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/open/export/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  try {
    const userId = findUserIdFromSession(session).userId;
    const result = exportJSON(quizId, userId);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/open/import route
 *
 * Request Headers:
 * - session: string — Session token for user authentication
 *
 * Request Body:
 * - fileName: string — name of file
 *
 * @returns {object} - Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/open/import', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const { fileName } = req.body;

  try {
    const userId = findUserIdFromSession(session).userId;
    const result = importJSON(fileName, userId);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * PUT /v1/open/attachment/:quizid route
 *
 * Request Headers:
 * - session: string — Session token for user authentication
 *
 * Path Parameters:
 * - quizid: number — ID of the quiz to attach the file to
 *
 * Request Body:
 * - attachment: string — The attachment content (e.g., base64 or URL string)
 *
 * @returns {object} - Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.put('/v1/open/attachment/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { attachment } = req.body;

  try {
    const userId = findUserIdFromSession(session).userId;
    const result = attachments(userId, quizId, attachment);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/open/attachment/:quizid route
 *
 * Request Headers:
 * - session: string — Session token for user authentication
 *
 * Path Parameters:
 * - quizid: number — of the quiz from which to retrieve the attachment
 *
 * Request Body:
 * - attachmentNumber: number — The index of the attachment to retrieve
 *
 * @returns {object} - Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/open/attachment/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { attachmentNumber } = req.body;

  try {
    const userId = findUserIdFromSession(session).userId;
    const result = seeAttachments(userId, quizId, attachmentNumber);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/open/hint/:playerid route
 *
 * Path Parameters:
 * - playerid: number — ID of player requesting the hint
 *
 * @returns {object} - return hint on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/open/hint/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  try {
    const result = hint(playerId, HUGGINGFACE_API_TOKEN);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/open/translate/:playerid route
 *
 * Path Parameters:
 * - playerid: number — The ID of the player requesting translation
 *
 * Request Headers:
 * - language: string — Target language
 *
 * @returns {object} - Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/open/translate/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const language = req.headers.language as string;

  try {
    const result = translate(playerId, language, HUGGINGFACE_API_TOKEN);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

/**
 * GET /v1/open/explain/:playerid route
 *
 * Path Parameters:
 * - playerid: number — The ID of the player requesting the explanation
 *
 * @returns {object} - Return result on success
 * @returns {object} - { error: string } on failure, with associated status code
 */
app.get('/v1/open/explain/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);

  try {
    const result = explain(playerId, HUGGINGFACE_API_TOKEN);

    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);

  // Load any saves
  load();
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  // Save the current database
  save();

  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
