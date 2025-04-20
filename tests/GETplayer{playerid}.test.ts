import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestPlayerJoin,
  requestPlayerStatus,
  OK,
  BADREQUEST
} from './testsHelper';

import { describe } from 'node:test';

const playerIdOffset = 727;

let session: string;
let quizId: number;
let questionId: number;
let gameId: number;
let playerId: number;
let timeCreated: number;
let timeLastEdited: number;

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
  timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;

  const responseQuestionCreate = requestAdminQuizQuestionCreate(
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
  questionId = responseQuestionCreate.body.questionId;
  timeLastEdited = Math.floor(Date.now() / 1000);

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
    const responsePlayerJoin = requestPlayerStatus(playerId);
    expect(responsePlayerJoin.body).toStrictEqual({
      state: 'LOBBY',
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number)
    });
    expect(responsePlayerJoin.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const responsePlayerJoin = requestPlayerStatus(playerId + playerIdOffset);
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid} works as intended', () => {

  });
});
