import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestPlayerJoin,
  requestCSV
} from './testsHelper';

import {
  actions,
  ErrorCodes,
  idOffset
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

  requestAdminQuizQuestionCreateV2(
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

  const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
  gameId = responseGameStart.body.gameId;

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );
  playerId = responsePlayerJoin.body.playerId;

  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.NEXT_QUESTION);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.SKIP_COUNTDOWN);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_ANSWER);
  requestAdminQuizGameStateUpdate(quizId, gameId, session, actions.GO_TO_FINAL_RESULTS);
});

describe('Testing GET /v1/open/CSV', () => {
  test('Testing the code 200 return value', () => {
    const responseGetGameResult = requestCSV(playerId, quizId, session);
    expect(responseGetGameResult.body).toStrictEqual(
      'usersRankedByScore\n' +
      'playerName,score\n' +
      'Name,0\n\n' +
      'questionResults\n' +
      'questionId,playersCorrect,averageAnswerTime,percentCorrect\n' +
      '3,,0,0'
    );
    expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.OK);
  });

  describe('Testing for error responses', () => {
    test('Testing when player does not exist in game', () => {
      const responseGetGameResult = requestCSV(playerId + idOffset, quizId, session);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing when game player is in hasn\'t ended', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      playerId = responsePlayerJoin.body.playerId;
      const responseGetGameResult = requestCSV(playerId, quizId, session);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
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
        const responseGetGameResult = requestCSV(playerId, quizId, session + 'Session Offset');
        expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    test('Testing when session is valid but not the owner of the quiz', () => {
      const responseRegister = requestAdminAuthRegister(
        'z7277f272@ad.unsw.edu.au',
        'Password1',
        'First',
        'Last'
      );
      session = responseRegister.body.session;

      const responseGetGameResult = requestCSV(playerId, quizId, session);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
    });
  });
});
