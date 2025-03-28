import {
  requestClear,
  responseInterface,
  requestAdminQuizCreate,
  requestAdminAuthRegister,
  requestAdminQuizQuestionCreate,
  requestDeleteQuizQuestion,
  requestAdminAuthLogin,
  requestAdminAuthLogout,
  requestGetQuiz
} from './testsHelper';

import { describe } from 'node:test';

const OK = 200;
const BADREQUEST = 400;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;
const questionIdOffset = 727;

let responseRegister: responseInterface;
let responseCreate: responseInterface;
let responseCreateQuestion: responseInterface;
let responseSomething: responseInterface;
let session: string;
let quizId: number;
let questionId: number;
