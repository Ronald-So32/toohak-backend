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
  adminQuizGameUpdate
} from './player';
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
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
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

// Save the current state of the data into the json file
export function save(): void {
  console.log(`Updating ${DB_PATH}`);
  const jsonData = JSON.stringify(getData(), null, 2);
  fs.writeFileSync(DB_PATH, jsonData);
}

// Load data from whatever is stored in the json file
export function load(): void {
  const data = getData();
  if (fs.existsSync(DB_PATH)) {
    console.log(`Loading data from ${DB_PATH}`);
    const jsonData = fs.readFileSync(DB_PATH).toString();
    const dataStore = JSON.parse(jsonData);
    Object.assign(data, dataStore);
  }
}

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400); // PLS don't mark us down for this route
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

  try {
    const result = adminAuthRegister(email, password, nameFirst, nameLast);

    return res.status(OK).json({ session: result.session });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

// POST /v1/admin/auth/login
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = adminAuthLogin(email, password);

    return res.status(OK).json({ session: result.session });
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

// GET /v1/admin/user/details
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

// PUT /v1/admin/user/details
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

// PUT /v1/admin/user/password
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

// POST /v1/admin/quiz
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

// GET /v1/admin/quiz/list
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

// DELETE /v1/admin/quiz/{quizid}
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

// DELETE /v2/admin/quiz/{quizid}
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

// GET /v1/admin/quiz/{quizid}
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

// GET /v2/admin/quiz/{quizid}
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

// POST /v1/admin/quiz/{quizid}/question
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

// POST /v2/admin/quiz/{quizid}/question
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

// PUT /v1/admin/quiz/{quizid}/name
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

// PUT /v1/admin/quiz/{quizid}/description
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

// POST /v1/admin/auth/logout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const session = req.headers.session as string;

  try {
    adminAuthLogout(session);

    return res.status(OK).json({});
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

// POST /v1/admin/quiz/{quizid}/transfer
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

// POST /v2/admin/quiz/{quizid}/transfer
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

// PUT /v1/admin/quiz/{quizid}/question/{questionid}
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

// PUT /v2/admin/quiz/{quizid}/question/{questionid}
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

// DELETE /v1/admin/quiz/{quizid}/question/{questionid}
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

// DELETE /v2/admin/quiz/{quizid}/question/{questionid}
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

// PUT /v1/admin/quiz/{quizid}/question/{questionid}/move
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

// GET /v1/admin/quiz/{quizId}/question/suggestion
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

// GET /v1/admin/quiz/{quizid}/games
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

// POST /v1/admin/quiz/{quizid}/game/start
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

// PUT /v1/admin/quiz/{quizid}/thumbnail
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

// GET /v1/admin/quiz/{quizid}/game/{gameid}
app.get('/v1/admin/quiz/:quizid/game/:gameid', (req: Request, res: Response) => {
  const session = req.headers.session as string;
  const quizId = parseInt(req.params.quizid);
  const gameId = parseInt(req.params.gameid);
  
  try {
    const userIdResult = findUserIdFromSession(session);
    const userId = userIdResult.userId;
    adminQuizGet(userId, quizId);
    // adminQuizGameStatus does NOT exist yet 
    const result = adminQuizGameStatus(userId, quizId, gameId);
    
    return res.status(OK).json(result);
  } catch (error) {
    return res.status(error.statusCode).json({ error: error.message });
  }
});

// PUT /v1/admin/quiz/{quizid}/game/{gameid}
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
