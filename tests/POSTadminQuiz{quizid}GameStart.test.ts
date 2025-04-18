import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizGameStart,
  requestAdminQuizGamesList,
  requestAdminQuizGameStatus,
  requestAdminQuizGameStateUpdate,
  requestAdminQuizQuestionCreateV2,
  requestPlayerJoin,
  OK,
  BADREQUEST,
  UNAUTHORISED,
  FORBIDDEN,
  quizIdOffset
} from './testsHelper';

import { describe } from 'node:test';

let session: string;
let quizId: number;
let questionId: number;

// Before each test clears the data stored and registers a new user and creates
// a quiz and a question, and obtains the user session and all the ids
beforeEach(() => {
  requestClear();
  const responseRegister = requestAdminAuthRegister(
    'z7277272@ad.unsw.edu.au',
    'Password1',
    'First',
    'Last'
  );
  session = responseRegister.body.session;
  const responseQuizCreate = requestAdminQuizCreate(
    session,
    'Name',
    'Description'
  );
  quizId = responseQuizCreate.body.quizId;

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
        ]
      }
    }
  );
  questionId = responseQuestionCreate.questionId
});

describe('Testing POST /v1/admin/quiz/{quizid}/game/start', () => {
  test('Testing the code 200 return value', () => {
    // Starts a game for the quiz
    const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
    // Checks that a valid request to start game returns a objet with the gameId
    // and also a status code of 200
    expect(responseGameStart.body).toStrictEqual({ gameId: expect.any(Number)});
    expect(responseGameStart.statusCode).toStrictEqual(OK);
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
        const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
        // Checks that a unauthorised request to start game returns an error object
        // and also a status code of 401
        expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGameStart.statusCode).toStrictEqual(UNAUTHORISED);
      });
    })

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseGameStart = requestAdminQuizGameStart(session, quizId + quizIdOffset, 3);
        // Checks that a forbidden request to start game returns an error object
        // and also a status code of 403
        expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGameStart.statusCode).toStrictEqual(FORBIDDEN);
      });

      test('Testing when quiz is not owned by user', () => {
        session = requestAdminAuthRegister(
          'z7277271@ad.unsw.edu.au',
          'Password1',
          'First',
          'Last'
        ).body.session;

        const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
        expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGameStart.statusCode).toStrictEqual(FORBIDDEN);
      });
    })

    test('Testing when autoStartNum is a number greater than 50', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 51);
      expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
      // Checks that a invalid request to start game returns an error object
      // and also a status code of 400
      expect(responseGameStart.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when autoStartNum is a number is exactly 50', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 50);
      expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGameStart.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when there are 10 games active', () => {
      // Starts 10 games which aren't in END state
      let responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGameStart.statusCode).toStrictEqual(BADREQUEST);
    });
    /*
    test('Testing when there are 10 games and one is in END state', () => {
      let responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      // Updates the status of one of games to end state then starts the 10th game
      requestAdminQuizGameStateUpdate(session, quizId, responseGameStart.gameId, END);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      expect(responseGameStart.body).toStrictEqual({ gameId: expect.any(Number)});
      expect(responseGameStart.statusCode).toStrictEqual(OK);
    });
    */
    test('Testing when a quiz has no questions', () => {
      // Creates a new quiz with no question
      quizId = requestAdminQuizCreate(
        session,
        'New Name',
        'Description'
      ).body.quizId;

      const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGameStart.statusCode).toStrictEqual(BADREQUEST);
    });
    
  });
  /*
  test('Testing PSOT /v1/admin/quiz/{quizid}/game/start  works as intended', () => {
    let responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
    expect(responseGameStart.body).toStrictEqual({ gameId: expect.any(Number)});
    expect(responseGameStart.statusCode).toStrictEqual(OK);
    // Gets the gameId of the game started
    const gameId1 = responseGameStart.body.gameId;
    // A player joins the game
    requestPlayerJoin(gameId1, 'Name');
    // Checks that the game exists and that the status is correct
    // for the game
    const responseGameStatus = requestAdminQuizGameStatus(session, gameId1);
    expect(responseGetGame.body).toStrictEqual({
      state: LOBBY,
      atQuestion: 1,
      players: [
        'Name'
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
    // Checks that it can starts a second game and gets the gameId of it
    responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
    expect(responseGameStart.body).toStrictEqual({ gameId: expect.any(Number)});
    expect(responseGameStart.statusCode).toStrictEqual(OK);
    const gameId2 = responseGameStart.body.gameId;

    // Updates the game to END state
    requestAdminQuizGameStateUpdate(session, quizId, gameId2, END);
    // Gets the list of games that was started for the quiz checking that
    // the games exists and that the game state was updated
    const responseGamesList = requestAdminQuizGamesList(session, quizId);
    expect(responseGamesList.body).toStrictEqual({
      activeGames: [
        gameId1
      ],
      inactiveGames: [
        gameId2
      ]
    });

  });
  */
});