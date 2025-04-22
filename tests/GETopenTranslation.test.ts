import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestTranslate
} from './testsHelper';

import {
  actions,
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
let gameId: number;
let playerId: number;

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

  requestAdminQuizQuestionCreateV2(
      quizId,
      session,
      {
        questionBody: {
          question: 'Who is the Monarch of England?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Queen Elizibeth',
              correct: false
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }
      }
    );
  

  requestAdminQuizQuestionCreateV2(
      quizId,
      session,
      {
        questionBody: {
          question: 'Who is the Queen of England?',
          timeLimit: 4,
          points: 5,
          answerOptions: [
            {
              answer: 'Prince Charles',
              correct: true
            },
            {
              answer: 'Queen Elizibeth',
              correct: false
            }
          ],
          thumbnailUrl: 'http://google.com/some/image/path.jpg'
        }
      }
    );

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );

  playerId = responsePlayerJoin.body.playerId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
});

describe('Testing GET /v1/player/{playerid}', () => {
  test('Testing the code 200 return value', () => {
    const responseHints = requestTranslate(playerId, 'Chinese');
    expect(responseHints.body).toStrictEqual(expect.any(String));
    expect(responseHints.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  test('Testing player is not found', () => {
      const responseHints = requestTranslate(playerId + idOffset, 'Chinese');
      expect(responseHints.body).toStrictEqual(expect.any(String));
      expect(responseHints.statusCode).toStrictEqual(ErrorCodes.OK);
    });
    
    test('Testing when game state is invalid', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
  
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
  
      playerId = responsePlayerJoin.body.playerId;
      let responseHints = requestTranslate(playerId, 'Chinese');
      expect(responseHints.body).toStrictEqual({ error: expect.any(String) });
      expect(responseHints.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
    
      responseHints = requestTranslate(playerId, 'Chinese');
      expect(responseHints.body).toStrictEqual({ error: expect.any(String) });
      expect(responseHints.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
    
      const slync = require('slync');
      slync(1000);
    
      responseHints = requestTranslate(playerId, 'Chinese');
      expect(responseHints.body).toStrictEqual({ error: expect.any(String) });
      expect(responseHints.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);
    
      responseHints = requestTranslate(playerId, 'Chinese');
      expect(responseHints.body).toStrictEqual({ error: expect.any(String) });
      expect(responseHints.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);
    
      responseHints = requestTranslate(playerId, 'Chinese');
      expect(responseHints.body).toStrictEqual({ error: expect.any(String) });
      expect(responseHints.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);
    
      responseHints = requestTranslate(playerId, 'Chinese');
      expect(responseHints.body).toStrictEqual({ error: expect.any(String) });
      expect(responseHints.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });
});
