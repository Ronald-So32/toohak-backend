import {
  requestClear,
  requestAdminAuthRegister,
  responseInterface,
  requestAdminQuizCreate,
  requestGetQuizQuestionSuggestion
} from './testsHelper';

const OK = 200;
const UNAUTHORISED = 401;
const FORBIDDEN = 403;

const quizIdOffset = 727;
let responseRegister: responseInterface;
let responseCreate: responseInterface;
let session: string;
let quizId: number;