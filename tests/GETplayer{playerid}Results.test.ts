import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestAdminStartGame,
  requestAdminUpdateGame,
  requestPlayerJoin,
  requestPlayerResults,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

<<<<<<< HEAD
import { describe } from 'node:test';

const gameIdOffset = 727727;
const playerIdOffset = 727727;

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

  const responsePlayerJoin = requestPlayerJoin(
    gameId,
    'Name'
  );
  playerId = requestGetPlayer.body.playerId;

  requestAdminUpdateGame(quizId, gameId, session, NEXT_QUESTION);
  requestAdminUpdateGame(quizId, gameId, session, SKIP_COUNTDOWN);
  requestAdminUpdateGame(quizId, gameId, session, GO_TO_ANSWER);
  requestAdminUpdateGame(quizId, gameId, session, GO_TO_FINAL_RESULTS);
});

describe('Testing GET /v1/admin/quiz/{quizid}/games', () => {
  test('Testing the code 200 return value', () => {
    const responseGetGameResult = requestPlayerResults(playerId);
    expect(responseGetGameResult.body).toStrictEqual({
      usersRankedByScore: [
        {
          playerName: 'Name',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId,
          playersCorrect: [],
          averageAnswerTime: expect.any(number),
          percentCorrect: expect.any(number)
        }
      ]
    });
    expect(responseGetGameResult.statusCode).toStrictEqual(OK);
  });

  describe('Testing for error responses', () => {

    test('Testing when player does not exist in game', () => {
      const responseGetGameResult = requestPlayerResults(playerId + playerIdOffset);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when game player is in hasn\'t ended', () => {
      const responseGameStart = requestAdminStartGame(session, quizId, 3);
      gameId = responseGameStart.body.gameId;
      const responsePlayerJoin = requestPlayerJoin(
        gameId,
        'Name'
      );
      playerId = requestGetPlayer.body.playerId;
      const responseGetGameResult = requestPlayerResults(playerId);
      expect(responseGetGameResult.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGetGameResult.statusCode).toStrictEqual(BADREQUEST);
    });

  });
});
=======
});
>>>>>>> f264ef966fd75a97f165c20d0ae608c5adea5618
