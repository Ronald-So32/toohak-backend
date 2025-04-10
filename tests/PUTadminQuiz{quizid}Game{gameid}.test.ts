import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminStartGame,
  requestAdminUpdateGame,
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
let gameId: number;

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

  const responseGameStart = requestAdminStartGame(session, quizId, 3);
  gameId = responseGameStart.body.gameId;
});

describe('Testing GET /v1/admin/quiz/{quizid}/games', () => {
  test('Testing the code 200 return value', () => {
    const responseUpdateGame = requestAdminUpdateGame(
      quizId,
      gameId,
      session, 
      NEXT_QUESTION
    );
    expect(responseUpdateGame.body).toStrictEqual({});
    expect(responseUpdateGame.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {

    test('Testing invalid game within quiz', () => {
      const responseUpdateGame = requestAdminUpdateGame(
        quizId,
        gameId + gameIdOffset,
        session, 
        NEXT_QUESTION
      );
      expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateGame.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing invalid action', () => {
      const responseUpdateGame = requestAdminUpdateGame(
        quizId,
        gameId,
        session, 
        GGEZ
      );
      expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateGame.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing action cannot be applied to current state', () => {
      const responseUpdateGame = requestAdminUpdateGame(
        quizId,
        gameId,
        session, 
        GO_TO_FINAL_RESULTS
      );
      expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateGame.statusCode).toStrictEqual(BADREQUEST);
    });

    describe('Testing status code of 401 return values', () => {
      test.each([
        {
          session: session + 'Invalid Session',
          description: 'Invalid session',
        },
        {
          session: '',
          description: 'Empty session',
        }
      ])('$description', ({ session }) => {
        const responseUpdateGame = requestAdminUpdateGame(
          quizId,
          gameId,
          session, 
          NEXT_QUESTION
        );
        expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdateGame.statusCode).toStrictEqual(UNAUTHORISED);
      });
    })
  
    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseUpdateGame = requestAdminUpdateGame(
          quizId + quizIdOffset,
          gameId,
          session,
          NEXT_QUESTION
        );
        expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdateGame.statusCode).toStrictEqual(FORBIDDEN);
      });
  
      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;
  
        const responseUpdateGame = requestAdminUpdateGame(
          quizId,
          gameId,
          session, 
          NEXT_QUESTION
        );
        expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdateGame.statusCode).toStrictEqual(FORBIDDEN);
      });
    })
  });
});
