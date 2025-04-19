import {
  getData,
  userInterface,
  gameInterface,
  playersInterface
} from './dataStore';
import {
  Errors,
  findQuizByUser,
  BetterError,
  ErrorCodes,
  quizStates,
  gameIdInterface,
  createUUID,
  actions
} from './functionsHelper';

// change types for all

export function adminGetQuizGames(userId: number, quizId: number): any { // change type
  const data = getData();

  findQuizByUser(userId, quizId);

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

export function adminQuizGameStart(
  userId: number,
  quizId: number,
  autoStartNum: number
): gameIdInterface {
  const data = getData();

  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  const quiz = findQuizByUser(userId, quizId);

  if (quiz.questions.length === 0) {
    throw new BetterError(
      Errors.noQuestion().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (autoStartNum > 50) {
    throw new BetterError(
      Errors.invalidString('AutoStartNum', Errors.Specific.AutoStartNum.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }

  if (data.games.filter((game: gameInterface) =>
    game.quizId === quizId && game.state !== quizStates.END).length >= 10) {
    throw new BetterError(
      Errors.tooMuchGames().error,
      ErrorCodes.BADREQUEST
    );
  }

  const id = createUUID();
  const players: playersInterface = { players: [] };

  data.games.push({
    gameId: id,
    quizId: quizId,
    state: quizStates.LOBBY,
    atQuestion: 1,
    players: players,
    metadata: quiz,
    autoStartNum: autoStartNum
  });

  return { gameId: id };
}

export function adminQuizGameUpdate(
  userId: number,
  quizId: number,
  gameId: number,
  action: string
) {
  const data = getData();

  findQuizByUser(userId, quizId);

  const game = data.games.find(
    g => g.gameId === gameId && g.metadata.quizId === quizId
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (!Object.values(actions).includes(action)) {
    throw new BetterError(
      Errors.invalidAction().error,
      ErrorCodes.BADREQUEST
    );
  }

  const actionValue = actions[action as keyof typeof actions];

  switch (actionValue) {
    case actions.NEXT_QUESTION:
      if (game.state === quizStates.QUESTION_COUNTDOWN ||
        game.state === quizStates.QUESTION_OPEN ||
        game.state === quizStates.FINAL_RESULTS ||
        game.state === quizStates.END
      ) {
        throw new BetterError(
          Errors.invalidAction().error,
          ErrorCodes.BADREQUEST
        );
      }
      game.state = quizStates.QUESTION_COUNTDOWN;

      timeout

      break;

    case actions.SKIP_COUNTDOWN:
      if (game.state === quizStates.LOBBY ||
        game.state === quizStates.QUESTION_OPEN ||
        game.state === quizStates.QUESTION_CLOSE ||
        game.state === quizStates.ANSWER_SHOW ||
        game.state === quizStates.FINAL_RESULTS ||
        game.state === quizStates.END
      ) {
        throw new BetterError(
          Errors.invalidAction().error,
          ErrorCodes.BADREQUEST
        );
      }
      game.state = quizStates.QUESTION_OPEN;

      timeout

      break;

    case actions.GO_TO_ANSWER:
      if (game.state === quizStates.LOBBY ||
        game.state === quizStates.QUESTION_COUNTDOWN ||
        game.state === quizStates.ANSWER_SHOW ||
        game.state === quizStates.FINAL_RESULTS ||
        game.state === quizStates.END
      ) {
        throw new BetterError(
          Errors.invalidAction().error,
          ErrorCodes.BADREQUEST
        );
      }
      game.state = quizStates.ANSWER_SHOW;
      break;

    case actions.GO_TO_FINAL_RESULTS:
      if (game.state === quizStates.LOBBY ||
        game.state === quizStates.QUESTION_COUNTDOWN ||
        game.state === quizStates.QUESTION_OPEN ||
        game.state === quizStates.FINAL_RESULTS ||
        game.state === quizStates.END
      ) {
        throw new BetterError(
          Errors.invalidAction().error,
          ErrorCodes.BADREQUEST
        );
      }
      game.state = quizStates.FINAL_RESULTS;
      break;

    case actions.END:
      if (game.state === quizStates.END) {
        throw new BetterError(
          Errors.invalidAction().error,
          ErrorCodes.BADREQUEST
        );
      }
      game.state = quizStates.END;
      break;
  }

  return {};
}
