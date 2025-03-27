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
  adminQuizCreate,
  adminQuizGet,
  adminQuizQuestionCreate,
  adminQuizDescriptionUpdate,
  adminQuizNameUpdate,
  adminQuizTransfer,
  adminQuizQuestionUpdate
} from './quiz';
import {
  findUserIdFromSession,
  Errors
} from './functionsHelper';

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

// POST /v1/admin/quiz/{quizid}/question
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { questionBody } = req.body;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const quizDetailsResult = adminQuizGet(userId, quizId);

  if ('error' in quizDetailsResult) {
    return res.status(FORBIDDEN).json({ error: quizDetailsResult.error });
  }

  const result = adminQuizQuestionCreate(userId, quizId, questionBody);

  if ('error' in result) {
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({ questionId: result.questionId });
});

// PUT /v1/admin/quiz/{quizid}/name
app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { name } = req.body;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminQuizNameUpdate(userId, quizId, name);

  if ('error' in result) {
    // Check for specific error messages to determine status code
    if (result.error === Errors.noPermissionError ||
        result.error === Errors.invalidQuizError) {
      return res.status(FORBIDDEN).json({ error: result.error });
    }
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({});
});

// PUT /v1/admin/quiz/{quizid}/description
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { description } = req.body;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminQuizDescriptionUpdate(userId, quizId, description);

  if ('error' in result) {
    // Check for specific error messages to determine status code
    if (result.error === Errors.noPermissionError ||
        result.error === Errors.invalidQuizError) {
      return res.status(FORBIDDEN).json({ error: result.error });
    }
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({});
});

// POST /v1/admin/auth/logout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const session = req.headers.session as string;

  const result = adminAuthLogout(session);

  if ('error' in result) {
    return res.status(UNAUTHORISED).json({ error: result.error });
  }

  return res.status(OK).json({});
});

// POST /v1/admin/quiz/{quizid}/transfer
app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const { userEmail } = req.body;

  const userIdResult = findUserIdFromSession(session);
  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const result = adminQuizTransfer(quizId, userId, userEmail);

  if ('error' in result) {
    // Check for specific error messages to determine status code
    if (result.error === Errors.noPermissionError ||
        result.error === Errors.invalidQuizError) {
      return res.status(FORBIDDEN).json({ error: result.error });
    }
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({});

});

// PUT /v1/admin/quiz/{quizid}/question/{questionid}
app.put('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { questionBody } = req.body;

  const userIdResult = findUserIdFromSession(session);

  if ('error' in userIdResult) {
    return res.status(UNAUTHORISED).json({ error: userIdResult.error });
  }

  const userId = userIdResult.userId;
  const quizDetailsResult = adminQuizGet(userId, quizId);

  if ('error' in quizDetailsResult) {
    return res.status(FORBIDDEN).json({ error: quizDetailsResult.error });
  }

  const question = quizDetailsResult.questions.find(question => question.quizId === questionId);
  if (!question) {
    return Errors.invalidQuestion();
  }

  const result = adminQuizQuestionUpdate(userId, quizId, questionId, questionBody);

  if ('error' in result) {
    return res.status(BADREQUEST).json({ error: result.error });
  }

  return res.status(OK).json({ questionId: result.questionId });
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
