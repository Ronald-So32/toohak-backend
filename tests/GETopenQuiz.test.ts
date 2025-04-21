import {
  requestClear,
  requestAdminAuthRegister,
  requestAdminQuizCreate,
  requestAdminQuizQuestionCreate,
  requestQuizExport,
  OK,
  BADREQUEST,
  FORBIDDEN,
  UNAUTHORISED
} from './testsHelper';

import { describe } from 'node:test';


let session: string;
let quizId: number;
// let questionId: number;
let gameId: number;
let playerId: number;
// let timeCreated: number;
// let timeLastEdited: number;

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
  // timeCreated = Math.floor(Date.now() / 1000);
  quizId = responseCreate.body.quizId;

  /* const responseQuestionCreate = */requestAdminQuizQuestionCreate(
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
  // questionId = responseQuestionCreate.body.questionId;
});

describe('Testing GET /v1/open/CSV', () => {
  test('Testing the code 200 return value', () => {
    const responseQuizExport = requestQuizExport(quizId, session);
    expect(responseQuizExport.body).toStrictEqual(
      'usersRankedByScore\n' +
      'playerName,score\n' +
      'Name,0\n\n' +
      'questionResults\n' +
      'questionId,playersCorrect,averageAnswerTime,percentCorrect\n' +
      '3,,0,0'
    );
    expect(responseQuizExport.statusCode).toStrictEqual(OK);
  });





});
