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
        ]
      }
    }
  );
});

describe('Testing GET /v1/admin/quiz/{quizid}/games', () => {
  test('Testing the code 200 return value', () => {
    const responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
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
        expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
        expect(responseGameStart.statusCode).toStrictEqual(UNAUTHORISED);
      });
    })

    describe('Testing status code of 403 return values', () => {
      test('Testing when quiz is does not exist', () => {
        const responseGameStart = requestAdminQuizGameStart(session, quizId + quizIdOffset, 3);
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
      expect(responseGameStart.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when autoStartNum is a number is exactly 50', () => {
      const responseGameStart = requestAdminQuizGameStart(session, quizId, 50);
      expect(responseGameStart.body).toStrictEqual({ error: expect.any(String) });
      expect(responseGameStart.statusCode).toStrictEqual(BADREQUEST);
    });

    test('Testing when there are 10 games active', () => {
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
      requestAdminQuizGameStateUpdate(session, quizId, responseGameStart.gameId, END);
      responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
      expect(responseGameStart.body).toStrictEqual({ gameId: expect.any(Number)});
      expect(responseGameStart.statusCode).toStrictEqual(OK);
    });

    test('Testing when a quiz has no questions', () => {
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

  test('Testing GET /v1/admin/quiz/{quizid}/games works as intended', () => {
    let responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
    expect(responseGameStart.body).toStrictEqual({ gameId: expect.any(Number)});
    expect(responseGameStart.statusCode).toStrictEqual(OK);
    const gameId1 = responseGameStart.body.gameId;
    requestPlayerJoin(gameId1, 'Name');
    const responseGameStatus = requestAdminQuizGameStatus(session, gameId1);
    expect(responseGetGame.body).toStrictEqual({
      state: LOBBY,
      atQuestion: 3,
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
    responseGameStart = requestAdminQuizGameStart(session, quizId, 3);
    requestAdminQuizGameStateUpdate(session, quizId, responseGameStart.gameId, END);

    const gameId2 = responseGameStart.body.gameId;
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
});