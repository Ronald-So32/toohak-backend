import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminStartGame,
  requestAdminUpdateGame,
  requestPlayerJoin,
  requestPlayerQuestionResult,
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

  let reponseQuestionCreate = requestAdminQuizQuestionCreate(
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
  questionId = responseQuestionCreat.body.questionId

  reponseQuestionCreate = requestAdminQuizQuestionCreate(
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
  questionId = responseQuestionCreat.body.questionId;

  const responseGameStart = requestAdminStartGame(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );
  
  playerId = requestGetPlayer.body.playerId;

  requestAdminUpdateGame(quizId, gameId, session, "NEXT_QUESTION");
  requestAdminUpdateGame(quizId, gameId, session, "SKIP_COUNTDOWN");
  requestAdminUpdateGame(quizId, gameId, session, "GO_TO_ANSWER");
});

describe('Testing GET /v1/player/{playerid}/question/{questionposition}/results', () => {
  test('Testing the code 200 return value', () => {
    const requestGetQuestionResult = requestPlayerQuestionResult(playerId, 1);
    expect(requestGetQuestionResult.body).toStrictEqual({
      questionId: questionId,
      playersCorrect: [],
      averageAnswerTime: expect.any(Number),
      percentCorrect: expect.any(Number)
    });
    expect(requestGetQuestionResult.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const requestGetQuestionResult = requestPlayerQuestionResult(playerId + playerIdOffset);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when question position given is not valid for the game', () => {
      const requestGetQuestionResult = requestPlayerQuestionResult(playerId, 3);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game is not currently on the question', () => {
      const requestGetQuestionResult = requestPlayerQuestionResult(playerId, 2);
      expect(requestGetQuestionResult.body).toStrictEqual({ error: expect.any(String) });
      expect(requestGetQuestionResult.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid}/question/{questionposition}/results works as intended', () => {

  });
});
