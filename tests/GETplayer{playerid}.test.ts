import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestPlayerStatus
} from './testsHelper';

import {
  actions,
  ErrorCodes,
  idOffset,
  quizStates
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

  requestAdminQuizQuestionCreate(
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
        ]
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
});

describe('Testing GET /v1/player/{playerid}', () => {
  test('Testing the code 200 return value', () => {
    const responsePlayerStatus = requestPlayerStatus(playerId);
    expect(responsePlayerStatus.body).toStrictEqual({
      state: 'LOBBY',
      numQuestions: 1,
      atQuestion: 0
    });
    expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const responsePlayerStatus = requestPlayerStatus(playerId + idOffset);
      expect(responsePlayerStatus.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid} works as intended', () => {
    // Gets the latest status of the current game and checks the state of the game
      let responsePlayerStatus = requestPlayerStatus(playerId);
      expect(responsePlayerStatus.body).toStrictEqual({
        state: 'LOBBY',
        numQuestions: 1,
        atQuestion: 0
      });
      expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.OK);
      
    
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
    
      // Checks that that game is in QUESTION_COUNTDOWN and atQuestion is 1
      responsePlayerStatus = requestPlayerStatus(playerId);
      expect(responsePlayerStatus.body).toStrictEqual({
        state: quizStates.QUESTION_COUNTDOWN,
        numQuestions: 1,
        atQuestion: 1
      });
      expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.OK);
    
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
    
      // Checks that that game is in QUESTION_OPEN
      responsePlayerStatus = requestPlayerStatus(playerId);
      expect(responsePlayerStatus.body).toStrictEqual({
        state: quizStates.QUESTION_COUNTDOWN,
        numQuestions: 1,
        atQuestion: 1
      });
      expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.OK);
    
      const slync = require('slync');
      slync(1000);
    
      // Checks that that game is in QUESTION_CLOSE
      responsePlayerStatus = requestPlayerStatus(playerId);
      expect(responsePlayerStatus.body).toStrictEqual({
        state: quizStates.QUESTION_CLOSE,
        numQuestions: 1,
        atQuestion: 1
      });
      expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.OK);
    
      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);
    
      // Checks that that game is in ANSWER_SHOW
      responsePlayerStatus = requestPlayerStatus(playerId);
      expect(responsePlayerStatus.body).toStrictEqual({
        state: quizStates.ANSWER_SHOW,
        numQuestions: 1,
        atQuestion: 1
      });
      expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.OK);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);
    
      // Checks that that game is in ANSWER_SHOW
      responsePlayerStatus = requestPlayerStatus(playerId);
      expect(responsePlayerStatus.body).toStrictEqual({
        state: quizStates.FINAL_RESULTS,
        numQuestions: 1,
        atQuestion: 1
      });
      expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.OK);

      requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.END);
    
      // Checks that that game is in ANSWER_SHOW
      responsePlayerStatus = requestPlayerStatus(playerId);
      expect(responsePlayerStatus.body).toStrictEqual({
        state: quizStates.END,
        numQuestions: 1,
        atQuestion: 1
      });
      expect(responsePlayerStatus.statusCode).toStrictEqual(ErrorCodes.OK);
  });
});
