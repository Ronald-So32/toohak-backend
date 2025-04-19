import {
  getData,
} from './dataStore';
import {
  Errors,
  findQuizByUser,
  BetterError,
  ErrorCodes,
  quizStates
} from './functionsHelper';

export function adminGetQuizGames(userId: number, quizId: number): any { // change type
  const data = getData();

  const quiz = findQuizByUser(userId, quizId);

  const quizGames = data.games.filter(game => 
    game.metadata.quizId === quiz.quizId
  );

  if (quizGames.length === 0) {
    throw new BetterError(
      Errors.invalidQuiz().error,
      ErrorCodes.FORBIDDEN
    );
  }

  const result = {
    activeGames: [] as number[],
    inactiveGames: [] as number[]
  };

  data.games.forEach(game => {
    if (game.state !== quizStates.END) {
      result.activeGames.push(game.metadata.quizId);
    } else {
      result.inactiveGames.push(game.metadata.quizId);
    }
  });

  return result;
}