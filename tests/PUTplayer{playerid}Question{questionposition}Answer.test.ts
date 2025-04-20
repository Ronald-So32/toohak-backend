import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminStartGame,
  requestAdminUpdateGame,
  requestPlayerJoin,
  requestGetPlayerQuestion,
  requestPlayerSubmit,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import { describe } from 'node:test';

const playerIdOffset = 727727;
const answerIdOffset = 727727;

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

  requestAdminUpdateGame(quizId, gameId, session, NEXT_QUESTION);
});

describe('Testing GET /v1/player/{playerid}', () => {
  test('Testing the code 200 return value', () => {
    const currentAnswerOptions = requestGetPlayerQuestion(playerId, 1).answerOptions;
    const responsePlayerSubmit = requestPlayerSubmit(
      currentAnswerOptions[0].answerId,
      playerId,
      1
    );
    expect(responsePlayerSubmit.body).toStrictEqual({});
    expect(responsePlayerSubmit.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
    test('Testing player Id does not exist', () => {
      const currentAnswerOptions = requestGetPlayerQuestion(playerId, 1).answerOptions;
      const responsePlayerSubmit = requestPlayerSubmit(
        [currentAnswerOptions[0].answerId],
        playerId + playerIdOffset,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when question position given is not valid for the game', () => {
      const currentAnswerOptions = requestGetPlayerQuestion(playerId, 3).answerOptions;
      const responsePlayerSubmit = requestPlayerSubmit(
        [currentAnswerOptions[0].answerId],
        playerId,
        3
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game is not in QUESTION_OPEN state', () => {
      const currentAnswerOptions = requestGetPlayerQuestion(playerId, 1).answerOptions;
      requestAdminUpdateGame(quizId, gameId, session, END);
      const responsePlayerSubmit = requestPlayerSubmit(
        [currentAnswerOptions[0].answerId],
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(BADREQUEST);
    });
    
    test('Testing when game is not currently on the question', () => {
      const currentAnswerOptions = requestGetPlayerQuestion(playerId, 2).answerOptions;
      const responsePlayerSubmit = requestPlayerSubmit(
        [currentAnswerOptions[0].answerId],
        playerId,
        2
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when answer is not valid for this particular question', () => {
      const currentAnswerOptions = requestGetPlayerQuestion(playerId, 2).answerOptions;
      const responsePlayerSubmit = requestPlayerSubmit(
        [currentAnswerOptions[0].answerId + answerIdOffset],
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when duplicate answerId provdied', () => {
      const currentAnswerOptions = requestGetPlayerQuestion(playerId, 1).answerOptions;
      const responsePlayerSubmit = requestPlayerSubmit(
        [
          currentAnswerOptions[0].answerId,
          currentAnswerOptions[0].answerId
        ],
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when less then 1 answer was submitted', () => {
      const currentAnswerOptions = requestGetPlayerQuestion(playerId, 1).answerOptions;
      const responsePlayerSubmit = requestPlayerSubmit(
        [],
        playerId,
        1
      );
      expect(responsePlayerSubmit.body).toStrictEqual({ error: expect.any(String) });
      expect(responsePlayerSubmit.statusCode).toStrictEqual(BADREQUEST);
    });
  });

  test('Testing GET /v1/player/{playerid} works as intended', () => {

  });
});
