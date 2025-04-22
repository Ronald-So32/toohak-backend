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

// Before each test clears the existing data and registers an user and
// then creates a quiz with 2 questions in it getting the session and quiz id
// and also starts a game and gets it game id
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
    // Updates the state of the game
    const responseUpdateGame = requestAdminQuizGameStateUpdate(
      quizId,
      gameId,
      session,
      actions.NEXT_QUESTION
    );
    // Checks that a valid request to update the state returns an empty object
    // and a status code of 200
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
        // Checks that a unauthorised request to update the state returns an error object
        // and a status code of 401
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
        // Checks that a forbidden request to update the state returns an error object
        // and a status code of 403
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
      // Checks that a invalid request to update the state returns an error object
        // and a status code of 400
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
          // Imports slync and then waits for 1 second to get to QUSETION_CLOSE state
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
          slync(1000);
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
  // Gets the latest status of the current game and checks the state of the game
  let responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.LOBBY);

  // Gets the list of games for the quiz and checks that it's in the correct list.
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

  // Checks that that game is in QUESTION_COUNTDOWN
  responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.QUESTION_COUNTDOWN);

  // Checks that that game is still active
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

  // Checks that that game is in QUESTION_OPEN
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
  slync(1000);

  // Checks that that game is in QUESTION_CLOSE
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

  // Checks that that game is in ANSWER_SHOW
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

  // Checks that that game is in FINAL_RESULTS
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

  // Checks that that game is in END
  responseGameStatus = requestAdminQuizGameStatus(quizId, gameId, session);
  expect(responseGameStatus.body.state).toStrictEqual(quizStates.END);

  // Checks that the game is inactive
  responseGamesList = requestAdminQuizGamesList(session, quizId);
  expect(responseGamesList.body).toStrictEqual({
    activeGames: [],
    inactiveGames: [
      gameId
    ]
  });
});
