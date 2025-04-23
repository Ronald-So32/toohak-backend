import {
  getData,
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
/**
 * Provides a list of all active and inactive games associated with the given
 * quiz owned by the user with Id userId
 *
 * @param {number} userId - The ID of the user retrieving the quiz
 * @param {number} quizId - The ID of the quiz
 *
 * @returns {{ result: object }} - An object containing
 * the following arrays: activeGames and inactiveGames
 */
export function adminGetQuizGames(userId: number, quizId: number): any { // change type
  const data = getData();
  // Helper function to check if quizId exists and if user owns this quiz
  findQuizByUser(userId, quizId);

  const result = {
    activeGames: [] as number[],
    inactiveGames: [] as number[]
  };
  // Check if game state is in END state, if not then put in active games array, else
  // put in inactive games array
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

/**
 * Allows user with given userId to start a game in the quiz with the given quizId
 *
 * @param {number} userId - The ID of the user starting the game
 * @param {number} quizId - The ID of the quiz
 * @param {number} autoStartNum - Number
 *
 * @returns {{ gameIdInterface: number }} - The gameId of a game
 */
export function adminQuizGameStart(
  userId: number,
  quizId: number,
  autoStartNum: number
): gameIdInterface {
  const data = getData();

  const quiz = findQuizByUser(userId, quizId);
  // Check if quiz question length is valid, ie. if there is a question
  if (quiz.questions.length === 0) {
    throw new BetterError(
      Errors.noQuestion().error,
      ErrorCodes.BADREQUEST
    );
  }
  // Check if autStartNum is valid
  if (autoStartNum > 50) {
    throw new BetterError(
      Errors.invalidString('AutoStartNum', Errors.Specific.AutoStartNum.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }
  // Check if there is 10 or more active games, if so then throw error
  if (data.games.filter((game: gameInterface) =>
    game.quizId === quizId && game.state !== quizStates.END).length >= 10) {
    throw new BetterError(
      Errors.tooMuchGames().error,
      ErrorCodes.BADREQUEST
    );
  }
  // No errors so do the below:
  const id = createUUID();
  // Initialise empty resultsInterface
  const initialiseResults: resultsInterface = {
    usersRankedByScore: [],
    questionResults: []
  };
  // Add a new game to games array
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
  // For each question, add object(results) which contains question results and stats
  for (const question of data.games[data.games.length - 1].metadata.questions) {
    const questionId = question.questionId;
    data.games[data.games.length - 1].results.questionResults.push(
      {
        questionId,
        playersCorrect: [],
        playersIncorrect: [],
        playersAnswerTime: [],
        averageAnswerTime: 0,
        totalAnswerTime: 0,
        percentCorrect: 0
      }
    );
  }

  return { gameId: id };
}

/**
 * Allows user to update game state
 *
 * @param {number} userId - The ID of the user updating game state
 * @param {number} quizId - The ID of the quiz
 * @param {number} gamemId - gameId of the game user is trying to update
 * @param {string} action - Action given by user to change game state
 *
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminQuizGameUpdate(
  userId: number,
  quizId: number,
  gameId: number,
  action: string
) {
  const data = getData();

  findQuizByUser(userId, quizId);
  // Check if game exists in given quiz
  const game = data.games.find(
    g => g.gameId === gameId && g.metadata.quizId === quizId
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }
  // Check if given action is valid
  if (!(<any>Object).values(actions).includes(action)) {
    throw new BetterError(
      Errors.invalidAction().error,
      ErrorCodes.BADREQUEST
    );
  }
  // Delete the times for given gameId if it exists
  if (data.activeTimers[gameId]) {
    clearTimeout(data.activeTimers[gameId]);
    delete data.activeTimers[gameId];
  }
  // Get string value from actions enum
  const actionValue = actions[action as keyof typeof actions];

  switch (actionValue) {
    // If given action is NEXT_QUESTION, transition game state to QUESTION_COUNTDOWN , 
    // increment question index, and set timers to open and then close the question.
    case actions.NEXT_QUESTION:{
      if (game.state === quizStates.QUESTION_COUNTDOWN ||
        game.state === quizStates.QUESTION_OPEN ||
        game.state === quizStates.FINAL_RESULTS ||
        game.state === quizStates.END ||
        game.atQuestion === game.metadata.questions.length
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

        const currentQuestion = game.metadata.questions[game.atQuestion - 1];
        data.timerTimeCreated[gameId] = Math.floor(Date.now() / 1000);
        data.activeTimers[gameId] = setTimeout(() => {
          if (game.state === quizStates.QUESTION_OPEN) {
            game.state = quizStates.QUESTION_CLOSE;
          }
        }, currentQuestion.timeLimit * 1000);
      }, 3000);

      break; }
    
    // If given action is SKIP_COUNTDOWN, transition into QUESTION_OPEN game state if 
    // conditions are valid, and set timeout for current question
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
      data.timerTimeCreated[gameId] = Math.floor(Date.now() / 1000);
      data.activeTimers[gameId] = setTimeout(() => {
        if (game.state === quizStates.QUESTION_OPEN) {
          game.state = quizStates.QUESTION_CLOSE;
        }
      }, currentQuestion.timeLimit * 1000);

      break;
    }
    // If action is GO_TO_ANSWER, change game state to ANSWER_SHOW
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
    // If game state is GO_TO_FINAL_RESULTS, change game state to FINAL_RESULTS
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
    // If game state is END, change game state to END
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


/**
 * Allows user to retrieve game status and intformation
 *
 * @param {number} userId - The ID of the user getting game state
 * @param {number} quizId - The ID of the quiz
 * @param {number} gamemId - gameId of the game user is trying to check status of 
 *
 * @returns {gameStatus: object | errorInterface} - Returns game status and info or 
 * error object
 */
export function adminQuizGameStatus(
  userId: number,
  quizId: number,
  gameId: number
) {
  const data = getData();

  findQuizByUser(userId, quizId);
  // Check if game exists in give quiz 
  const game = data.games.find(
    g => g.gameId === gameId && g.metadata.quizId === quizId
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }
  // Return object containing game info and status
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

/**
 * Allows user get game results
 *
 * @param {number} userId - The ID of the user getting game result
 * @param {number} quizId - The ID of the quiz
 * @param {number} gamemId - gameId of the game user is getting results of 
 *
 * @returns {usersRankedByScore: usersRankedByScoreInterface[], questionResults: 
 * Partial<questionResultsInterface>[] | errorInterface} - Returns error object or
 * array of objects usersRankedByScore
 */
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
  // Check if game state is in FINAL_RESULTS state
  if (game.state !== quizStates.FINAL_RESULTS) {
    throw new BetterError(
      Errors.invalidGame().error,
      ErrorCodes.BADREQUEST
    );
  }

  // From here
  // Initialise results and player scores for each player
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
  // Calculate stats per question, avg time, players correct, etc., award points to 
  // correct players, rank players, store info into game data
  for (const question of game.metadata.questions) {
    const questionId = question.questionId;
    const questionResult = game.results.questionResults.find(qr => qr.questionId === questionId);

    if (questionResult.playersCorrect.length > 0) {
      questionResult.averageAnswerTime = Math.round(questionResult.totalAnswerTime /
      (questionResult.playersCorrect.length + questionResult.playersIncorrect.length));

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


/**
 * Allows player to join a game
 *
 * @param {number} gamemId - gameId of game
 * @param {string} playerName - Given name of player
 *
 * @returns {playerid: number | errorInterface} - Returns playerid on success or 
 * an error object
 */
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
  // If entered player name is empty string, generate random five letter 3 number name
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
  // Check if playername is alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(playerName)) {
    throw new BetterError(
      Errors.invalidPlayerName().error,
      ErrorCodes.BADREQUEST
    );
  }
  // Check if player name already exists
  if (game.players.some(p => p === playerName)) {
    throw new BetterError(
      Errors.invalidPlayerName().error,
      ErrorCodes.BADREQUEST
    );
  }
  // Check if game state is LOBBY
  if (game.state !== quizStates.LOBBY) {
    throw new BetterError(
      Errors.invalidPlayerName().error,
      ErrorCodes.BADREQUEST
    );
  }

  const playerId = createUUID();
  // Add a player to game, generate unique playerId, check if number of players 
  // has reached autoStartNum of game 
  game.players.push(playerName);
  game.playersWithId.push({ playerName, playerId });
  if (game.autoStartNum === game.players.length) {
    game.state = quizStates.QUESTION_COUNTDOWN;

    game.atQuestion += 1;

    data.activeTimers[gameId] = setTimeout(() => {
      game.state = quizStates.QUESTION_OPEN;

      const currentQuestion = game.metadata.questions[game.atQuestion - 1];
      data.timerTimeCreated[gameId] = Math.floor(Date.now() / 1000);
      data.activeTimers[gameId] = setTimeout(() => {
        if (game.state === quizStates.QUESTION_OPEN) {
          game.state = quizStates.QUESTION_CLOSE;
        }
        console.log(currentQuestion);
      }, currentQuestion.timeLimit * 1000);
    }, 3000);
  }

  return { playerId };
}

/**
 * Get the status of a game a player is in
 *
 * @param {number} playerId - playerId of player
 * 
 * @returns {playerStatus: object | errorInterface} - Returns status of game the 
 * player is in or error object
 */
export function playerStatus(playerid: number) {
  const data = getData();
  // Check if given player exists in games
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
  // Check player exists in games
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
  question.percentCorrect = Math.round(
    (question.playersCorrect.length / game.players.length) * 100);
  question.totalAnswerTime = question.playersAnswerTime.reduce(
    (sum: number, time: number) => sum + time, 0);
  question.averageAnswerTime = (question.totalAnswerTime /
    (question.playersCorrect.length + question.playersIncorrect.length));

  if (!question.averageAnswerTime) {
    question.averageAnswerTime = 0;
  }
  return {
    questionId: question.questionId,
    playersCorrect: question.playersCorrect,
    averageAnswerTime: question.averageAnswerTime,
    percentCorrect: question.percentCorrect,
  };
}

export function playerFinalResults(playerId: number) {
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

  if (game.state !== quizStates.FINAL_RESULTS) {
    throw new BetterError(
      Errors.invalidPlayer().error,
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

    if (questionResult.playersCorrect.length > 0) {
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

export function playerAnswerSubmit(
  playerId: number,
  questionPosition: number,
  answerIds: number[]
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

  if (game.state !== quizStates.QUESTION_OPEN) {
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

  if (answerIds.length < 1) {
    throw new BetterError(
      Errors.invalidAnswer().error,
      ErrorCodes.BADREQUEST
    );
  }

  const uniqueAnswerIds = new Set(answerIds);
  if (uniqueAnswerIds.size !== answerIds.length) {
    throw new BetterError(
      Errors.invalidAnswer().error,
      ErrorCodes.BADREQUEST
    );
  }

  const currentQuestionAnswers = game.metadata.questions[questionPosition - 1].answerOptions;
  const validAnswerIds = currentQuestionAnswers.map(answer => answer.answerId);
  const allAnswersValid = answerIds.every(id => validAnswerIds.includes(id));

  if (!allAnswersValid) {
    throw new BetterError(
      Errors.invalidAnswer().error,
      ErrorCodes.BADREQUEST
    );
  }

  const question = game.results.questionResults[questionPosition - 1];

  question.playersAnswerTime[playerId] = Math.floor(Date.now() / 1000) -
                                          data.timerTimeCreated[game.gameId];

  const player = game.playersWithId.find(p => p.playerId === playerId);

  const correctIndex = question.playersCorrect.findIndex(p => p === player.playerName);
  const incorrectIndex = question.playersIncorrect.findIndex(p => p === player.playerName);
  if (correctIndex !== -1) {
    question.playersCorrect.splice(correctIndex, 1);
  }
  if (incorrectIndex !== -1) {
    question.playersIncorrect.splice(incorrectIndex, 1);
  }

  const correctAnswers = currentQuestionAnswers.filter(a =>
    a.correct === true).map(answer => answer.answerId);

  if (correctAnswers.sort().toString() === answerIds.sort().toString()) {
    question.playersCorrect.push(player.playerName);
  } else {
    question.playersIncorrect.push(player.playerName);
  }

  return {};
}
