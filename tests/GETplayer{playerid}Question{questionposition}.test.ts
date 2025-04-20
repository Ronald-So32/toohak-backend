import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestPlayerQuestionInfo,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import { describe } from 'node:test';

const playerIdOffset = 727;

let session: string;
let quizId: number;
let questionId: number;
let questionId2: number;
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
  questionId = responseQuestionCreate.body.questionId

  const responseQuestionCreate2 = requestAdminQuizQuestionCreate(
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
        ]
      }
    }
  );
  questionId2 = responseQuestionCreate2.body.questionId;

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );
  
  playerId = responsePlayerJoin.body.playerId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, "NEXT_QUESTION");
  requestAdminQuizGameStateUpdate(quizId, gameId, session, "SKIP_COUNTDOWN");
});

describe('Testing GET /v1/player/{playerid}', () => {
  test('Testing the code 200 return value', () => {
    const requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 1);
    expect(requestGetPlayerQuestion.body).toStrictEqual({
      questionId: questionId,
      question: 'Who is the Monarch of England?',
      timeLimit: 4,
      thumbnailUrl: '',
      points: 5,
      answerOptions: [
        {
          answerId: expect.any(Number),
          answer: 'Prince Charles',
          colour: expect.any(String)
        },
        {
          answerId: expect.any(Number),
          answer: 'Queen Elizibeth',
          colour: expect.any(String)
        }
      ]
    });
    expect(requestGetPlayerQuestion.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId + playerIdOffset, 1);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when question position given is not valid for the game', () => {
      const requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 3);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game is not currently on the question', () => {
      const requestGetPlayerQuestion = requestPlayerQuestionInfo(playerId, 2);
      expect(requestGetPlayerQuestion.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetPlayerQuestion.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid} works as intended', () => {

  });
});
