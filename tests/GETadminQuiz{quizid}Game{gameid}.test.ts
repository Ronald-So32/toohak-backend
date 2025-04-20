import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizThumbnailUpdate,
  requestAdminQuizGameStart,
  requestAdminQuizGameStatus,
  // requestPlayerJoin,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import {
  quizStates,
  // actions,
  // ErrorCodes
} from '../src/functionsHelper';

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

  const responseQuestionCreate = requestAdminQuizQuestionCreateV2(
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
  questionId = responseQuestionCreate.body.questionId;
  requestAdminQuizThumbnailUpdate(
    quizId,
    session,
    'http://google.com/some/image/path.jpg'
  );
  timeLastEdited = Math.floor(Date.now() / 1000);

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  // requestPlayerJoin(gameId, 'Name');
});

describe('Testing GET /v1/admin/quiz/{quizid}/game/{gameid}', () => {
  test('Testing the code 200 return value', () => {
    const responseGetGame = requestAdminQuizGameStatus(
      quizId,
      gameId,
      session
    );
    expect(responseGetGame.body).toStrictEqual({
      state: quizStates.LOBBY,
      atQuestion: 0,
      players: [
        // 'Name'
      ],
      metadata: {
        quizId: quizId,
        name: 'Name',
        timeCreated: timeCreated,
        timeLastEdited: timeLastEdited,
        description: 'Description',
        numQuestions: 1,
        questions: [
          {
            questionId: questionId,
            question: 'Who is the Monarch of England?',
            timeLimit: 4,
            thumbnailUrl: 'http://google.com/some/image/path.jpg',
            points: 5,
            answerOptions: [
              {
                answerId: expect.any(Number),
                answer: 'Prince Charles',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Queen Elizibeth',
                colour: expect.any(String),
                correct: false
              }
            ]
          }
        ],
        timeLimit: 4,
        thumbnailUrl: 'http://google.com/some/image/path.jpg'
      }
    });
    expect(responseGetGame.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {
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
        const responseGetGame = requestAdminQuizGameStatus(
          quizId,
          gameId,
          session
        );
        expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGame.statusCode).toStrictEqual(UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseGetGame = requestAdminQuizGameStatus(
          quizId + quizIdOffset,
          gameId,
          session
        );
        expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGame.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        const responseGetGame = requestAdminQuizGameStatus(
          quizId,
          gameId,
          session
        );
        expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGame.statusCode).toStrictEqual(FORBIDDEN);
      });
    });

    test('Testing invalid game within quiz', () => {
      const responseGetGame = requestAdminQuizGameStatus(
        quizId,
        gameId + gameIdOffset,
        session
      );
      expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGame.statusCode).toStrictEqual(BADREQUEST);
    });
  });
});

test('Testing GET /v1/admin/quiz/{quizid}/game/{gameid}  works as intended', () => {

});
