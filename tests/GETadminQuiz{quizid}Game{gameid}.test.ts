import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminStartGame,
  requestAdminGetGame,
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
    const responseGetGame = requestAdminGetGame(
      quizId,
      gameId,
      session
    );
    expect(responseGetGame.body).toStrictEqual({
      state: LOBBY,
      atQuestion: 3,
      players: [],
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
                answerId: expect.any(number),
                answer: 'Prince Charles',
                colour: red,
                correct: true
              },
              {
                answerId: expect.any(number),
                answer: 'Queen Elizibeth',
                colour: red,
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

    test('Testing invalid game within quiz', () => {
      const responseGetGame = requestAdminGetGame(
        quizId,
        gameId + gameIdOffset,
        session
      );
      expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGame.statusCode).toStrictEqual(BADREQUEST);
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
        const responseGetGame = requestAdminGetGame(
          quizId,
          gameId,
          session
        );
        expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGame.statusCode).toStrictEqual(UNAUTHORISED);
      });
    })
  
    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseGetGame = requestAdminGetGame(
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
  
        const responseGetGame = requestAdminGetGame(
          quizId,
          gameId,
          session
        );
        expect(responseGetGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGame.statusCode).toStrictEqual(FORBIDDEN);
      });
    })
  });
});
