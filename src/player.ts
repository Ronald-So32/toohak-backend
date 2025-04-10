import {
  getData,
} from './dataStore';
import {
  Errors,
  findQuizByUser,
  BetterError,
  ErrorCodes
} from './functionsHelper';

export function requestAdminGetQuizGames(userId: number, quizId: number): any { // change
  const data = getData();

  const quiz = findQuizByUser(userId, quizId);

  const gameToUpdate = data.games.find(game => 
    game.metadata.quizId === quiz.quizId
  );

  if (!gameToUpdate) {
    throw new BetterError(
      Errors.invalidQuiz().error,
      ErrorCodes.BADREQUEST
    );
  }

  return {};
}