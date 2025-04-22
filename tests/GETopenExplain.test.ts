import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestExplain,
  requestPlayerQuestionInfo,
  requestPlayerAnswerSubmit,
  OK,
  BADREQUEST
} from './testsHelper';

import { describe } from 'node:test';

const playerIdOffset = 727727;
const answerIdOffset = 727727;

let session: string;
let quizId: number;
// let questionId: number;
let gameId: number;
let playerId: number;
// let timeCreated: number;
// let timeLastEdited: number;

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
  // timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;

  /* const responseQuestionCreate2 = */requestAdminQuizQuestionCreate(
    quizId,
    session,
    {
      questionBody: {
        question: 'Who plays league of legends?',
        timeLimit: 4,
        points: 5,
        answerOptions: [
          {
            answer: 'Faker',
            correct: true
          },
          {
            answer: 'TheShy',
            correct: true
          },
          {
            answer: 'Ruler',
            correct: true
          },
          {
            answer: 'Froxxal',
            correct: false
          }
        ]
      }
    }
  );
  // questionId = responseQuestionCreate2.body.questionId;

  /* const responseQuestionCreate = */requestAdminQuizQuestionCreate(
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
  // questionId = responseQuestionCreate.body.questionId;

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );

  playerId = responsePlayerJoin.body.playerId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'NEXT_QUESTION');
  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'SKIP_COUNTDOWN');
  requestAdminQuizGameStateUpdate(quizId, gameId, session, 'GO_TO_ANSWER');
});

describe('Testing GET /v1/player/{playerid}', () => {
  test('Testing the code 200 return value', () => {
    const responseHints = requestExplain(playerId);
    expect(responseHints.body).toStrictEqual(expect.any(String));
    expect(responseHints.statusCode).toStrictEqual(OK);
  });
});