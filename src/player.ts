import {
  getData,
} from './dataStore';
import {
  Errors,
  findQuizByUser,
} from './functionsHelper';

export function requestAdminUpdateGame(userId: number, quizId: number): any // change {
  const data = getData();

  const quiz = findQuizByUser(userId, quizId);

  

  return {};
}