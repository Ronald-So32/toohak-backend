import { clear } from './other';
import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
} from './auth';
import {
  adminQuizList,
  adminQuizRemove,
  adminQuizCreate,
  adminQuizGet
} from './quiz';
import { findUserIdFromSession } from './functionsHelper';

import express, {
  json,
  Request,
  Response
} from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
// import request from 'sync-request-curl';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;
// const NOTFOUND = 404;

// const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(
  YAML.parse(file),
  { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }
));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(BADREQUEST);
  }

  return res.json(result);
});

// DELETE /v1/clear route
app.delete('/v1/clear', (req: Request, res: Response) => {
  clear();

  return res.status(OK).json({});
});

// POST /v1/admin/auth/register
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  const result = adminAuthRegister(email, password, nameFirst, nameLast);

  if ('error' in result) {
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({ session: result.session });
});

// POST /v1/admin/auth/login
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = adminAuthLogin(email, password);

  if ('error' in result) {
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({ session: result.session });
});

// GET /v1/admin/user/details
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const session = req.headers.session as string;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminUserDetails(userId);

  if ('error' in result) {
    return res.status(UNAUTHORISED).json({ error: result.error });
  }

  return res.status(OK).json({ user: result.user });
});

// PUT /v1/admin/user/details
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const { email, nameFirst, nameLast } = req.body;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminUserDetailsUpdate(userId, email, nameFirst, nameLast);

  if ('error' in result) {
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({});
});

// PUT /v1/admin/user/password
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const { oldPassword, newPassword } = req.body;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminUserPasswordUpdate(userId, oldPassword, newPassword);

  if ('error' in result) {
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({});
});

// POST /v1/admin/quiz
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const { name, description } = req.body;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminQuizCreate(userId, name, description);

  if ('error' in result) {
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({ quizId: result.quizId });
});

// GET /v1/admin/quiz/list
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const session = req.headers.session as string;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminQuizList(userId);

  if ('error' in result) {
    return res.status(UNAUTHORISED).json({ error: result.error });
  }

  return res.status(OK).json({ quizzes: result.quizzes });
});

// DELETE /v1/admin/quiz/{quizid}
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminQuizRemove(userId, quizId);

  if ('error' in result) {
    return res.status(FORBIDDEN).json({ error: result.error });
  }

  return res.status(OK).json({});
});

// GET /v1/admin/quiz/{quizid}
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminQuizGet(userId, quizId);

  if ('error' in result) {
    return res.status(FORBIDDEN).json({ error: result.error });
  }

  return res.status(OK).json(result.details);
});

// POST /v1/admin/quiz/{quizid}/transfer
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { userEmail } = req.body;

  // Check if session is valid
  const userIdResult = findUserIdFromSession(session);
  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }
  const userId = userIdResult.userId;

  // Get all users to check if target email exists
  const data = getData();
  
  // Check if quiz exists
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return res.status(FORBIDDEN).json({ error: `Quiz with ID ${quizId} does not exist` });
  }

  const quiz = data.quizzes[quizIndex];
  
  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    return res.status(FORBIDDEN).json({ error: 'You do not have permission to transfer this quiz' });
  }

  // Find the target user by email
  const targetUser = data.users.find(user => user.email === userEmail);
  if (!targetUser) {
    return res.status(BADREQUEST).json({ error: 'Target user email does not exist' });
  }

  // Check if target user is the same as current user
  if (userEmail === data.users.find(user => user.userId === userId)?.email) {
    return res.status(BADREQUEST).json({ error: 'Cannot transfer quiz to yourself' });
  }

  // Check if target user already has a quiz with the same name
  const nameConflict = data.quizzes.some(q => 
    q.createdBy === targetUser.userId && q.name === quiz.name);
  if (nameConflict) {
    return res.status(BADREQUEST).json({ 
      error: 'Target user already has a quiz with the same name' 
    });
  }

  // All checks passed, transfer the quiz
  data.quizzes[quizIndex].createdBy = targetUser.userId;
  
  return res.status(OK).json({});
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
