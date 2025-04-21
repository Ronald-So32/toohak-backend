import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreateV2,
  requestAdminQuizGameStart,
  requestAdminQuizGameStateUpdate,
  requestAdminQuizGameStatus,
  requestAdminQuizGamesList,
} from './testsHelper';

import {
  quizStates,
  actions,
  ErrorCodes,
  idOffset
} from '../src/functionsHelper';

import { describe } from 'node:test';

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

  requestAdminQuizQuestionCreateV2(
    quizId,
    session,
    {
      questionBody: {
        question: 'Question 2',
        timeLimit: 1,
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
});

describe('Testing PUT /v1/admin/quiz/{quizid}/game/{gameid}', () => {
  test('Testing the code 200 return value', () => {
    const responseUpdateGame = requestAdminQuizGameStateUpdate(
      quizId,
      gameId,
      session,
      actions.NEXT_QUESTION
    );
    expect(responseUpdateGame.body).toStrictEqual({});
    expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);
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
        const responseUpdateGame = requestAdminQuizGameStateUpdate(
          quizId,
          gameId,
          session,
          actions.NEXT_QUESTION
        );
        expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.UNAUTHORISED);
      });
    });

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseUpdateGame = requestAdminQuizGameStateUpdate(
          quizId + idOffset,
          gameId,
          session,
          actions.NEXT_QUESTION
        );
        expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        const responseUpdateGame = requestAdminQuizGameStateUpdate(
          quizId,
          gameId,
          session,
          actions.NEXT_QUESTION
        );
        expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
        expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.FORBIDDEN);
      });
    });

    test('Testing invalid game within quiz', () => {
      const responseUpdateGame = requestAdminQuizGameStateUpdate(
        quizId,
        gameId + idOffset,
        session,
        actions.NEXT_QUESTION
      );
      expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    test('Testing invalid action', () => {
      const responseUpdateGame = requestAdminQuizGameStateUpdate(
        quizId,
        gameId,
        session,
        'GGEZ'
      );
      expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
      expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
    });

    describe('Testing action cannot be applied to current state', () => {
      describe('Testing invalid actions in LOBBY state', () => {
        test.each([
          {
            state: actions.SKIP_COUNTDOWN
          },
          {
            state: actions.GO_TO_ANSWER
          },
          {
            state: actions.GO_TO_FINAL_RESULTS
          }
        ])('$state', ({ state }) => {
          const responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });

      describe('Testing invalid actions in QUESTION_COUNTDOWN state', () => {
        test.each([
          {
            state: actions.NEXT_QUESTION
          },
          {
            state: actions.GO_TO_ANSWER
          },
          {
            state: actions.GO_TO_FINAL_RESULTS
          }
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });

      describe('Testing invalid actions in QUSETION_OPEN state', () => {
        test.each([
          {
            state: actions.NEXT_QUESTION
          },
          {
            state: actions.SKIP_COUNTDOWN
          },
          {
            state: actions.GO_TO_FINAL_RESULTS
          }
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });

      describe('Testing invalid actions in QUSETION_CLOSE state', () => {
        test(actions.SKIP_COUNTDOWN, () => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);
          const slync = require('slync');
          slync(1000);
          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });

      describe('Testing invalid actions in FINAL_RESULTS state', () => {
        test.each([
          {
            state: actions.NEXT_QUESTION
          },
          {
            state: actions.SKIP_COUNTDOWN
          },
          {
            state: actions.GO_TO_ANSWER
          },
          {
            state: actions.GO_TO_FINAL_RESULTS
          }
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.GO_TO_ANSWER
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.GO_TO_FINAL_RESULTS
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });

      describe('Testing invalid actions in ANSWER_SHOW state', () => {
        test.each([
          {
            state: actions.SKIP_COUNTDOWN
          },
          {
            state: actions.GO_TO_ANSWER
          }
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.GO_TO_ANSWER
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });

      describe('Testing invalid actions in END state', () => {
        test.each([
          {
            state: actions.NEXT_QUESTION
          },
          {
            state: actions.SKIP_COUNTDOWN
          },
          {
            state: actions.GO_TO_ANSWER
          },
          {
            state: actions.GO_TO_FINAL_RESULTS
          },
          {
            state: actions.END
          },
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.END
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({ error: expect.any(String) });
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.BADREQUEST);
        });
      });
    });

    describe('Testing action can be applied to current state', () => {
      describe('Testing valid actions in LOBBY state', () => {
        test.each([
          {
            state: actions.NEXT_QUESTION
          },
          {
            state: actions.END
          }
        ])('$state', ({ state }) => {
          const responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);
        });
      });

      describe('Testing valid actions in QUESTION_COUNTDOWN state', () => {
        test.each([
          {
            state: actions.SKIP_COUNTDOWN
          },
          {
            state: actions.END
          }
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);
        });
      });

      describe('Testing valid actions in QUSETION_OPEN state', () => {
        test.each([
          {
            state: actions.GO_TO_ANSWER
          },
          {
            state: actions.END
          }
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);
        });
      });

      describe('Testing valid actions in QUSETION_CLOSE state', () => {
        test.each([
          {
            state: actions.NEXT_QUESTION
          },
          {
            state: actions.GO_TO_ANSWER
          },
          {
            state: actions.GO_TO_FINAL_RESULTS
          },
          {
            state: actions.END
          }
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);
          const slync = require('slync');
          slync(4727);
          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          // TODO CHECK WITH GET GAMES (check state and question num)
        });
      });

      describe('Testing valid actions in FINAL_RESULTS state', () => {
        test(actions.END, () => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.END
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);
        });
      });

      describe('Testing valid actions in ANSWER_SHOW state', () => {
        test.each([
          {
            state: actions.NEXT_QUESTION
          },
          {
            state: actions.GO_TO_FINAL_RESULTS
          },
          {
            state: actions.END
          }
        ])('$state', ({ state }) => {
          let responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.NEXT_QUESTION
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.SKIP_COUNTDOWN
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            actions.GO_TO_ANSWER
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

          responseUpdateGame = requestAdminQuizGameStateUpdate(
            quizId,
            gameId,
            session,
            state
          );
          expect(responseUpdateGame.body).toStrictEqual({});
          expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);
        });
      });
    });
  });
});

test('Testing PUT /v1/admin/quiz/{quizid}/game/{gameid} works as intended', () => {
  let responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.LOBBY);

  let responseGamesList = requestAdminQuizGamesList(session, quizId);
  expect(responseGamesList.body).toStrictEqual({
    activeGames: [
      gameId
    ],
    inactiveGames: []
  });

  let responseUpdateGame = requestAdminQuizGameStateUpdate(
    quizId,
    gameId,
    session,
    actions.NEXT_QUESTION
  );
  expect(responseUpdateGame.body).toStrictEqual({});
  expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

  responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.QUESTION_COUNTDOWN);

  responseGamesList = requestAdminQuizGamesList(session, quizId);
  expect(responseGamesList.body).toStrictEqual({
    activeGames: [
      gameId
    ],
    inactiveGames: []
  });

  responseUpdateGame = requestAdminQuizGameStateUpdate(
    quizId,
    gameId,
    session,
    actions.SKIP_COUNTDOWN
  );
  expect(responseUpdateGame.body).toStrictEqual({});
  expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

  responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.QUESTION_OPEN);

  responseGamesList = requestAdminQuizGamesList(session, quizId);
  expect(responseGamesList.body).toStrictEqual({
    activeGames: [
      gameId
    ],
    inactiveGames: []
  });
  const slync = require('slync');
  slync(4727);

  responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.QUESTION_CLOSE);

  responseGamesList = requestAdminQuizGamesList(session, quizId);
  expect(responseGamesList.body).toStrictEqual({
    activeGames: [
      gameId
    ],
    inactiveGames: []
  });

  responseUpdateGame = requestAdminQuizGameStateUpdate(
    quizId,
    gameId,
    session,
    actions.GO_TO_ANSWER
  );
  expect(responseUpdateGame.body).toStrictEqual({});
  expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

  responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.ANSWER_SHOW);

  responseGamesList = requestAdminQuizGamesList(session, quizId);
  expect(responseGamesList.body).toStrictEqual({
    activeGames: [
      gameId
    ],
    inactiveGames: []
  });

  responseUpdateGame = requestAdminQuizGameStateUpdate(
    quizId,
    gameId,
    session,
    actions.GO_TO_FINAL_RESULTS
  );
  expect(responseUpdateGame.body).toStrictEqual({});
  expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

  responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.FINAL_RESULTS);

  responseGamesList = requestAdminQuizGamesList(session, quizId);
  expect(responseGamesList.body).toStrictEqual({
    activeGames: [
      gameId
    ],
    inactiveGames: []
  });

  responseUpdateGame = requestAdminQuizGameStateUpdate(
    quizId,
    gameId,
    session,
    actions.END
  );
  expect(responseUpdateGame.body).toStrictEqual({});
  expect(responseUpdateGame.statusCode).toStrictEqual(ErrorCodes.OK);

  responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.END);

  responseGamesList = requestAdminQuizGamesList(session, quizId);
  expect(responseGamesList.body).toStrictEqual({
    activeGames: [],
    inactiveGames: [
      gameId
    ]
  });
});
