import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminStartGame,
  requestAdminUpdateGame,
  requestPlayerJoin,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import { describe } from 'node:test';

const gameIdOffset = 727;

let session: string;
let quizId: number;
let questionId: number;
let gameId: number;
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

  const reponseQuestionCreate = requestAdminQuizQuestionCreate(
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
  timeLastEdited = Math.floor(Date.now() / 1000);

  const responseGameStart = requestAdminStartGame(session, quizId, 3);
  gameId = responseGameStart.body.gameId;
});

describe('Testing GET /v1/admin/quiz/{quizid}/games', () => {
  test('Testing the code 200 return value', () => {
    const responsePlayerJoin = requestPlayerJoin(
      gameId,
      'Name'
    );
    expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(number)});
    expect(responsePlayerJoin.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing invalid palyer name', () => {
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'name!@#$%^&*()_+'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(number)});
      expect(responsePlayerJoin.statusCode).toStrictEqual(OK);
    });

    test('Testing player name entered is not unique', () => {
      let responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ playerId: expect.any(number)});
      expect(responsePlayerJoin.statusCode).toStrictEqual(OK);

      responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing invalid game within quiz', () => {
      const responsePlayerJoin = requestPlayerJoin(
        gameId + gameIdOffset,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game state is not in LOBBY', () => {
      requestAdminUpdateGame(quizId, gameId, session, END);
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      expect(responsePlayerJoin.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerJoin.statusCode).toStrictEqual(BADREQUEST);
    });
  
  });
});