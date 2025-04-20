import {
  getData,
  userInterface,
  gameInterface,
  resultsInterface,
  usersRankedByScoreInterface,
  questionResultsInterface
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
    if (game.metadata.quizId === quizId) {
      if (game.state !== quizStates.END) {
        result.activeGames.push(game.gameId);
      } else {
        result.inactiveGames.push(game.gameId);
      }
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

  const initialiseResults: resultsInterface = {
    usersRankedByScore: [],
    questionResults: []
  };

  data.games.push({
    gameId: id,
    quizId: quizId,
    state: quizStates.LOBBY,
    atQuestion: 0,
    players: [],
    playersWithId: [],
    metadata: quiz,
    autoStartNum: autoStartNum,
    results: initialiseResults
  });

  for (const question of data.games[data.games.length - 1].metadata.questions) {
    const questionId = question.questionId;
    data.games[data.games.length - 1].results.questionResults.push(
      {
        questionId,
        playersCorrect: [],
        playersIncorrect: [],
        averageAnswerTime: 0,
        totalAnswerTime: 0,
        percentCorrect: 0
      }
    );
  }

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

  if (data.activeTimers[gameId]) {
    clearTimeout(data.activeTimers[gameId]);
    delete data.activeTimers[gameId];
  }

  const actionValue = actions[action as keyof typeof actions];

  switch (actionValue) {
    case actions.NEXT_QUESTION:{
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

      game.atQuestion += 1;

      data.activeTimers[gameId] = setTimeout(() => {
        game.state = quizStates.QUESTION_OPEN;

        const currentQuestion = game.metadata.questions[game.atQuestion];
        data.activeTimers[gameId] = setTimeout(() => {
          if (game.state === quizStates.QUESTION_OPEN) {
            game.state = quizStates.QUESTION_CLOSE;
          }
        }, currentQuestion.timeLimit * 1000);
      }, 3000);

      break; }

    case actions.SKIP_COUNTDOWN: {
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

      const currentQuestion = game.metadata.questions[game.atQuestion - 1];
      data.activeTimers[gameId] = setTimeout(() => {
        if (game.state === quizStates.QUESTION_OPEN) {
          game.state = quizStates.QUESTION_CLOSE;
        }
      }, currentQuestion.timeLimit * 1000);

      break;
    }
    case actions.GO_TO_ANSWER:{
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
    }
    case actions.GO_TO_FINAL_RESULTS:{
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
    }
    case actions.END:{
      if (game.state === quizStates.END) {
        throw new BetterError(
          Errors.invalidAction().error,
          ErrorCodes.BADREQUEST
        );
      }
      game.state = quizStates.END;
      break;
    }
  }

  return {};
}

export function adminQuizGameStatus(
  userId: number,
  quizId: number,
  gameId: number
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

  return {
    state: game.state,
    atQuestion: game.atQuestion,
    players: game.players,
    metadata: {
      quizId: game.metadata.quizId,
      name: game.metadata.name,
      timeCreated: game.metadata.timeCreated,
      timeLastEdited: game.metadata.timeLastEdited,
      description: game.metadata.description,
      numQuestions: game.metadata.numQuestions,
      questions: game.metadata.questions,
      timeLimit: game.metadata.timeLimit,
      thumbnailUrl: game.metadata.thumbnailUrl
    }

  };
}

export function adminQuizGameResults(
  userId: number,
  quizId: number,
  gameId: number
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

  if (game.state !== quizStates.FINAL_RESULTS) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }

  // From here
  const results: {
    usersRankedByScore: usersRankedByScoreInterface[];
    questionResults: questionResultsInterface[];
  } = {
    usersRankedByScore: [],
    questionResults: []
  };

  const playerScores: Record<string, number> = {};
  game.players.forEach(player => {
    playerScores[player] = 0;
  });

  for (const question of game.metadata.questions) {
    const questionId = question.questionId;
    const questionResult = game.results.questionResults.find(qr => qr.questionId === questionId);

    if (questionResult.totalAnswerTime && questionResult.playersCorrect.length > 0) {
      questionResult.averageAnswerTime = Math.round(questionResult.totalAnswerTime /
      (questionResult.playersCorrect.length + questionResult.playersIncorrect.length));
    }

    if (questionResult.playersCorrect.length > 0) {
      questionResult.percentCorrect = Math.round(
        (questionResult.playersCorrect.length / game.players.length) * 100
      );
    }

    questionResult.playersCorrect.forEach((player, index) => {
      const position = index + 1;
      const scalingFactor = 1 / position;
      const points = question.points;
      const questionScore = points * scalingFactor;

      playerScores[player] += questionScore;
    });

    results.questionResults.push(questionResult);
  }

  results.usersRankedByScore = Object.entries(playerScores)
    .map(([playerName, score]) => ({ playerName, score }))
    .sort((a, b) => b.score - a.score);

  game.results.usersRankedByScore = results.usersRankedByScore;
  // To Here
  // Should be moved into a helper that updates the results every state
  // Could be optimised to not overwrite and recalcate if possible

  return {
    usersRankedByScore: results.usersRankedByScore,
    questionResults: results.questionResults.map(qr => ({
      questionId: qr.questionId,
      playersCorrect: qr.playersCorrect,
      averageAnswerTime: qr.averageAnswerTime,
      percentCorrect: qr.percentCorrect
    }))
  };
}

export function playerJoin(
  gameId: number,
  playerName: string
) {
  const data = getData();

  const game = data.games.find(
    g => g.gameId === gameId
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (playerName === '') {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let randomLetters = '';
    while (randomLetters.length < 5) {
      const randomChar = letters[Math.floor(Math.random() * letters.length)];
      if (!randomLetters.includes(randomChar)) {
        randomLetters += randomChar;
      }
    }

    const numbers = '0123456789';
    let randomNumbers = '';
    while (randomNumbers.length < 3) {
      const randomNum = numbers[Math.floor(Math.random() * numbers.length)];
      if (!randomNumbers.includes(randomNum)) {
        randomNumbers += randomNum;
      }
    }

    playerName = randomLetters + randomNumbers;
  }

  if (!/^[a-zA-Z0-9]+$/.test(playerName)) {
    throw new BetterError(
      Errors.invalidPlayerName().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (game.players.some(p => p === playerName)) {
    throw new BetterError(
      Errors.invalidPlayerName().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (game.state !== quizStates.LOBBY) {
    throw new BetterError(
      Errors.invalidPlayerName().error,
      ErrorCodes.BADREQUEST
    );
  }

  const playerId = createUUID();

  game.players.push(playerName);
  game.playersWithId.push({ playerName, playerId });

  return { playerId };
}

export function playerStatus(playerid: number) {
  const data = getData();

  const game = data.games.find(g =>
    g.playersWithId?.some(p => p.playerId === playerid)
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }

  return {
    state: game.state,
    numQuestions: game.metadata.numQuestions,
    atQuestion: game.atQuestion
  };
}

export function playerQuestion(
  playerId: number,
  questionPosition: number
) {
  const data = getData();

  const game = data.games.find(g =>
    g.playersWithId?.some(p => p.playerId === playerId)
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  const invalidStates = [
    'LOBBY',
    'QUESTION_COUNTDOWN',
    'FINAL_RESULTS',
    'END'
  ];

  if (invalidStates.includes(game.state)) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (questionPosition < 1 || questionPosition > game.metadata.numQuestions) {
    throw new BetterError(
      Errors.invalidQuestionPosition().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (game.atQuestion !== questionPosition) {
    throw new BetterError(
      Errors.invalidQuestionPosition().error,
      ErrorCodes.BADREQUEST
    );
  }

  const question = game.metadata.questions[questionPosition - 1];

  return {
    questionId: question.questionId,
    question: question.question,
    timeLimit: question.timeLimit,
    thumbnailUrl: question.thumbnailUrl || '',
    points: question.points,
    answerOptions: question.answerOptions.map(option => ({
      answerId: option.answerId,
      answer: option.answer,
      colour: option.colour
    }))
  };
}

export function playerQuestionResults(
  playerId: number,
  questionPosition: number
) {
  const data = getData();

  const game = data.games.find(g =>
    g.playersWithId?.some(p => p.playerId === playerId)
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (game.state !== quizStates.ANSWER_SHOW) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (questionPosition < 1 || questionPosition > game.metadata.numQuestions) {
    throw new BetterError(
      Errors.invalidQuestionPosition().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (game.atQuestion !== questionPosition) {
    throw new BetterError(
      Errors.invalidQuestionPosition().error,
      ErrorCodes.BADREQUEST
    );
  }

  const question = game.results.questionResults[questionPosition - 1];

  return {
    questionId: question.questionId,
    playersCorrect: question.playersCorrect,
    averageAnswerTime: question.averageAnswerTime,
    percentCorrect: question.percentCorrect,
  };
}

export function playerFinalResults(playerId: number) {

  return {}
}
