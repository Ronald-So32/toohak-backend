import {
  getData,
  questionsInterface,
  answersInterface,
  userInterface,
  quizInterface
} from './dataStore';
import {
  createUUID,
  validQuizName,
  quizSummariesInterface,
  quizIdInterface,
  quizDetailsInterface,
  quizGetDetailsInterface,
  questionIdInterface,
  Errors,
  validQuestionString,
  randomColour,
  validatePoints,
  validateAnswers,
  getCurrentTimestamp,
  findQuizByUser,
  getLongestQuestionLine,
  BetterError,
  ErrorCodes,
  checkActiveGames
} from './functionsHelper';

import request from 'sync-request-curl';

/**
 * Provides a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} userId - The ID of the user
 *
 * @returns {{ quizzes: quizSummariesInterface[] } | errorInterface} - Always returns
 * an object, quizzes with an array of quizSummariesInterface inside of it unless
 * there is an error which returns errorInterface
 */
export function adminQuizList(
  userId: number
): { quizzes: quizSummariesInterface[] } {
  // Fetches the latest data from the dataStore
  const data = getData();

  // Checks if the user exists
  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Iterate through all quizzes and put in quizzes array if quiz is created by
  // user of passed in userId
  const quizzes = data.quizzes
    .filter((quiz: quizInterface) => quiz.createdBy === userId)
    .map((quiz: quizInterface) => ({
      quizId: quiz.quizId,
      name: quiz.name,
    }));

  return { quizzes };
}

/**
 * Retrieves all information about a specific quiz.
 *
 * @param {number} userId - The ID of the user requesting the quiz
 * @param {number} quizId - The ID of the quiz to retrieve
 *
 * @returns {quizGetDetailsInterface | errorInterface} - Returns either the quiz
 * details or an error object
 */
export function adminQuizGet(
  userId: number,
  quizId: number
): quizGetDetailsInterface {
  const data = getData();

  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the quiz exists and created by the user
  const quiz = findQuizByUser(userId, quizId);

  return {
    details: {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
      numQuestions: quiz.numQuestions,
      questions: quiz.questions,
      timeLimit: quiz.timeLimit,
    }
  };
}

export function adminQuizGetV2(
  userId: number,
  quizId: number
): quizGetDetailsInterface {
  const data = getData();

  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the quiz exists and created by the user
  const quiz = findQuizByUser(userId, quizId);

  return {
    details: {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
      numQuestions: quiz.numQuestions,
      questions: quiz.questions,
      timeLimit: quiz.timeLimit,
      thumbnailUrl?: quiz.thumbnailUrl
    }
  };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {number} userId - Id of the user
 * @param {string} name - Name of the quiz
 * @param {string} description - Description of the quiz
 *
 * @returns {quizIdInterface | errorInterface} - Always return quizId object otherwise an
 * error object with relevant error message
 */
export function adminQuizCreate(
  userId: number,
  name: string,
  description: string
): quizIdInterface {
  const data = getData();

  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the name of the quiz is valid
  validQuizName(name);

  // Checks if the name is already in use
  const duplicate = data.quizzes.some(
    (quiz: quizInterface) => quiz.name === name && quiz.createdBy === userId
  );
  if (duplicate) {
    throw new BetterError(
      Errors.invalidString('Quiz name', Errors.Specific.QuizName.IN_USE).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Check if description length is valid (max 100 characters)
  if (description.length > 100) {
    throw new BetterError(
      Errors.invalidString('Quiz description', Errors.Specific.Description.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Creates a UUID for the quiz
  const id = createUUID();

  // Gets the current timestamp
  const timeStamp = getCurrentTimestamp();

  const questionsArray: questionsInterface[] = [];

  // All details are correct so append new quiz to data.quizzes
  data.quizzes.push({
    quizId: id,
    name: name,
    timeCreated: timeStamp,
    timeLastEdited: timeStamp,
    description: description,
    createdBy: userId,
    numQuestions: 0,
    questions: questionsArray,
    timeLimit: 0,
  });

  return {
    quizId: id
  };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {number} userId - Id of the user
 * @param {number} quizId - Id of the quiz
 *
 * @returns {Record<string, never> | errorInterface} - Always return an empty
 * object otherwise an error object with relevant error message
 */
export function adminQuizRemove(
  userId: number,
  quizId: number
): Record<string, never> {
  const data = getData();

  const userExists = data.users.some((user: userInterface) => user.userId === userId);
  if (!userExists) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Finds the quiz index of the quiz in the quizzes array
  const quizIndex = data.quizzes.findIndex((quiz: quizInterface) => quiz.quizId === quizId);

  // Validates if the quiz exists
  if (quizIndex === -1) {
    throw new BetterError(
      Errors.invalidQuiz().error,
      ErrorCodes.FORBIDDEN
    );
  }

  // Checks if the user owns the quiz
  const quiz = data.quizzes[quizIndex];
  if (quiz.createdBy !== userId) {
    throw new BetterError(
      Errors.noPermission().error,
      ErrorCodes.FORBIDDEN
    );
  }

  // Removes the quiz from the quizzes array
  data.quizzes.splice(quizIndex, 1);

  return {};
}

export function adminQuizRemoveV2(
  userId: number,
  quizId: number
): Record<string, never> {
  checkActiveGames(quizId);

  adminQuizRemove(userId, quizId);

  return {};
}

/**
 * Get all the relevant information about the current quiz.
 *
 * @param {number} userId - Id of the user
 * @param {number} quizId - Id of the quiz
 *
 * @returns {quizDetailsInterface | errorInterface} - Always return quiz object
 * otherwise an error object with relevant error message
 */
export function adminQuizInfo(
  userId: number,
  quizId: number
): quizDetailsInterface {
  const data = getData();

  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  const quiz = findQuizByUser(userId, quizId);

  // Return quiz details if found
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description
  };
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {number} userId - Id of the user
 * @param {number} quizId - Id of the quiz
 * @param {string} name - The new name of the quiz
 *
 * @returns {Record<string, never> | errorInterface} - Always return an empty
 * object otherwise an error object with relevant error message
 */
export function adminQuizNameUpdate(
  userId: number,
  quizId: number,
  name: string
): Record<string, never> {
  const data = getData();

  const user = data.users.find((user: userInterface) => user.userId === userId);
  if (!user) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  const quiz = findQuizByUser(userId, quizId);

  validQuizName(name);

  // Check if name is already used by the same user for another quiz
  const nameExists = data.quizzes.some((q: quizInterface) =>
    q.createdBy === userId &&
    q.name === name &&
    q.quizId !== quizId
  );

  if (nameExists) {
    throw new BetterError(
      Errors.invalidString('Quiz name', Errors.Specific.QuizName.IN_USE).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Update the quiz name
  quiz.name = name;

  // Update timeLastEdited
  quiz.timeLastEdited = getCurrentTimestamp();

  return {};
}

/**
 * Update the description of the relevant quiz.
 *
 * @param {number} userId - Id of the user
 * @param {number} quizId - Id of the quiz
 * @param {string} description - The new description of the quiz
 *
 * @returns {Record<string, never> | errorInterface} - Always return an empty
 * object otherwise an error object with relevant error message
 */
export function adminQuizDescriptionUpdate(
  userId: number,
  quizId: number,
  description: string
): Record<string, never> {
  const data = getData();

  const user = data.users.find((user: userInterface) => user.userId === userId);
  if (!user) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  const quiz = findQuizByUser(userId, quizId);

  if (description.length > 100) {
    throw new BetterError(
      Errors.invalidString('Quiz description', Errors.Specific.Description.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Update the quiz description
  quiz.description = description;

  quiz.timeLastEdited = getCurrentTimestamp();

  return {};
}

/**
 * Creates a new question for a quiz.
 *
 * @param {number} userId - The ID of the user creating the question
 * @param {number} quizId - The ID of the quiz to add the question to
 * @param {questionsInterface} questionBody - The question details including
 * text, time limit, points, and answers
 *
 * @returns {questionIdInterface | errorInterface} - Returns either the new question
 * ID or an error object
 */
export function adminQuizQuestionCreate(
  userId: number,
  quizId: number,
  questionBody: questionsInterface
): questionIdInterface {
  const data = getData();

  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  const quiz = findQuizByUser(userId, quizId);

  const { question, timeLimit, points, answerOptions } = questionBody;

  // Validates the question string
  validQuestionString(question);

  // Validates the answers given
  validateAnswers(answerOptions);

  // Checks if the time limit given is positive
  if (timeLimit <= 0) {
    throw new BetterError(
      Errors.invalidString('Time limit', Errors.Specific.Time.POSITIVE).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the total time limit of quiz exceeds 3 minutes
  const totalTime = quiz.questions.reduce(
    (sum: number, q: questionsInterface) => sum + q.timeLimit, 0
  ) + timeLimit;
  if (totalTime > 180) {
    throw new BetterError(
      Errors.invalidString('Total time limit', Errors.Specific.Time.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the points given is valid
  validatePoints(points);

  // Gives a unique id to each answer in the question
  let answerId = 0;
  const updatedAnswerOptions = answerOptions.map((option: answersInterface) => {
    answerId++;
    return {
      ...option,
      id: answerId,
      colour: randomColour(),
    };
  });

  const id = createUUID();

  // Creates the questionInterface body
  const newQuestion: questionsInterface = {
    questionId: id,
    question,
    timeLimit,
    points,
    answerOptions: updatedAnswerOptions
  };
  // Appends the new question to the questionsInterface array of current quiz
  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.timeLimit += timeLimit;
  // Updates the count for numbers of questions in quiz
  quiz.numQuestions += 1;

  return {
    questionId: id
  };
}

export function adminQuizQuestionCreateV2(
  userId: number,
  quizId: number,
  questionBody: questionsInterface
): questionIdInterface {
  const thumbnailUrl = questionBody.thumbnailUrl.toLowerCase();

  // Validate thumbnail
  if (thumbnailUrl === '') {
    throw new BetterError(
      Errors.invalidString('Thumbnail', Errors.Specific.Thumbnail.EMPTY).error,
      ErrorCodes.BADREQUEST
    );
  }

  if (!thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
    throw new BetterError(
      Errors.invalidString('Thumbnail', Errors.Specific.Thumbnail.START).error,
      ErrorCodes.BADREQUEST
    );
  }

  if (!thumbnailUrl.endsWith('jpg') &&
    !thumbnailUrl.endsWith('jpeg') &&
    !thumbnailUrl.endsWith('png')) {
    throw new BetterError(
      Errors.invalidString('Thumbnail', Errors.Specific.Thumbnail.END).error,
      ErrorCodes.BADREQUEST
    );
  }

  const v1 = adminQuizQuestionCreate(userId, quizId, questionBody);

  const quiz = findQuizByUser(userId, quizId);

  const question = quiz.questions.find(
    (q: questionsInterface) => q.questionId === v1.questionId
  );

  question.thumbnailUrl = questionBody.thumbnailUrl;

  return v1;
}

/**
 * Transfers ownership of a quiz to another user.
 *
 * @param {number} quizId - The ID of the quiz to transfer
 * @param {number} userId - The ID of the current owner
 * @param {string} userEmail - The email of the new owner
 *
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminQuizTransfer(
  quizId: number,
  userId: number,
  userEmail: string
): Record<string, never> {
  const data = getData();

  // Checks if the quiz exists and gets the index of the quiz
  const quizIndex = data.quizzes.findIndex((quiz: quizInterface) => quiz.quizId === quizId);
  if (quizIndex === -1) {
    throw new BetterError(
      Errors.invalidQuiz().error,
      ErrorCodes.FORBIDDEN
    );
  }

  const quiz = data.quizzes[quizIndex];

  // Checks if the quiz is created by the user
  if (quiz.createdBy !== userId) {
    throw new BetterError(
      Errors.noPermission().error,
      ErrorCodes.FORBIDDEN
    );
  }

  // Checks if the target exist through email
  const targetUser = data.users.find((user: userInterface) => user.email === userEmail);
  if (!targetUser) {
    throw new BetterError(
      Errors.invalidEmail().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the target email is the user himself
  const currentUser = data.users.find((user: userInterface) => user.userId === userId);
  if (userEmail === currentUser.email) {
    throw new BetterError(
      Errors.invalidString('User email', Errors.Specific.Email.SELF).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the target user has the quiz of the same name
  const nameConflict = data.quizzes.some((quizzes: quizInterface) =>
    quizzes.createdBy === targetUser.userId && quiz.name === quizzes.name);
  if (nameConflict) {
    throw new BetterError(
      Errors.invalidString('User email', Errors.Specific.Email.NAME).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Transfers the ownership of the quiz to target user
  data.quizzes[quizIndex].createdBy = targetUser.userId;

  return {};
}

export function adminQuizTransferV2(
  quizId: number,
  userId: number,
  userEmail: string
): Record<string, never> {
  checkActiveGames(quizId);

  adminQuizTransfer(quizId, userId, userEmail);

  return {};
}

/**
 * Deletes a question from a quiz.
 *
 * @param {number} quizId - The ID of the quiz containing the question
 * @param {number} userId - The ID of the user deleting the question
 * @param {number} questionId - The ID of the question to delete
 *
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminDeleteQuizQuestion(
  quizId: number,
  userId: number,
  questionId: number
): Record<string, never> {
  const data = getData();

  const user = data.users.find((user: userInterface) => user.userId === userId);
  if (!user) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  const quiz = findQuizByUser(userId, quizId);

  // Check if questionId is in given quiz
  const validQuestionIndex = quiz.questions.findIndex(
    (question: questionsInterface) => question.questionId === questionId
  );
  if (validQuestionIndex === -1) {
    throw new BetterError(
      Errors.invalidQuestion().error,
      ErrorCodes.BADREQUEST
    );
  }

  const deletedQuestion = quiz.questions[validQuestionIndex];

  // Updates the time limit of the quiz after the questions deleted
  quiz.timeLimit -= deletedQuestion.timeLimit;
  // Updates the number of question in the quiz after the questions deleted
  quiz.numQuestions -= 1;

  // Delete question from its questionId
  quiz.questions.splice(validQuestionIndex, 1);

  return {};
}

export function adminDeleteQuizQuestionV2(
  quizId: number,
  userId: number,
  questionId: number
): Record<string, never> {
  const data = getData();

  // Check if there is a game running with this quiz that isn't END
  const activeGameExists = data.games.some(
    game => game.metadata.quizId === quizId && game.state !== 'END'
  );

  if (activeGameExists) {
    throw new BetterError(
      Errors.gameRunning().error,
      ErrorCodes.BADREQUEST
    );
  }

  const v1 = adminDeleteQuizQuestion(quizId, userId, questionId);

  return v1;
}

/**
 * Moves a question to a new position within a quiz.
 *
 * @param {number} quizId - The ID of the quiz containing the question
 * @param {number} userId - The ID of the user moving the question
 * @param {number} questionId - The ID of the question to move
 * @param {number} newPosition - The new position for the question
 *
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminQuizQuestionMove(
  quizId: number,
  userId: number,
  questionId: number,
  newPosition: number
): Record<string, never> {
  const data = getData();

  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  const quiz = findQuizByUser(userId, quizId);

  const validQuestionIndex = quiz.questions.findIndex(
    (question: questionsInterface) => question.questionId === questionId
  );
  if (validQuestionIndex === -1) {
    throw new BetterError(
      Errors.invalidQuestion().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Position is less than 0
  if (newPosition < 0) {
    throw new BetterError(
      Errors.invalidString('Position', Errors.Specific.Position.TOO_SHORT).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Position greater than number of questions
  if (newPosition > quiz.numQuestions - 1) {
    throw new BetterError(
      Errors.invalidString('Position', Errors.Specific.Position.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Position is the same as current position of question
  if (validQuestionIndex === newPosition) {
    throw new BetterError(
      Errors.invalidString('Position', Errors.Specific.Position.OLD_SAME).error,
      ErrorCodes.BADREQUEST
    );
  }

  const question = quiz.questions[validQuestionIndex];
  // Changes the position of the questions
  quiz.questions.splice(validQuestionIndex, 1);
  quiz.questions.splice(newPosition, 0, question);

  quiz.timeLastEdited = getCurrentTimestamp();

  return {};
}

/**
 * Generates a suggested question for a quiz using an LLM.
 *
 * @param {string} quizName - The name of the quiz
 * @param {string} quizDescription - The description of the quiz
 * @param {string} HUGGINGFACE_API_TOKEN - The API token for HuggingFace
 *
 * @returns {{ question: string } | errorInterface} - Returns either the generated
 * question or an error object
 */
export function adminQuizQuestionSuggestion(
  quizName: string,
  quizDescription: string,
  HUGGINGFACE_API_TOKEN: string
): { question: string } {
  // Create a prompt for the LLM that includes the quiz context
  const prompt = `You are a helpful assistant that generates quiz questions. 
  Please suggest a single question for a quiz with the following details:
  
  Quiz name: "${quizName}"
  Quiz description: "${quizDescription}"
  
  The question should be relevant to the quiz topic, clear, and concise. 
  The question should be between 5 and 50 characters.
  
  Respond with just the question text, nothing else.`;

  const response = request(
    'POST',
    'https://api-inference.huggingface.co/models/google/gemma-2-2b-it',
    {
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      json: {
        inputs: prompt
      }
    });

  const responseBody = JSON.parse(response.body.toString());

  if ('error' in responseBody) {
    throw new BetterError(
      { error: responseBody.error }.error,
      ErrorCodes.BADREQUEST
    );
  }

  let generatedQuestion = responseBody[0].generated_text;
  const questionMatch = getLongestQuestionLine(generatedQuestion);
  if (!questionMatch) {
    generatedQuestion = `What is ${quizName} about?`;
  } else {
    generatedQuestion = questionMatch;
  }

  // Ensure the question meets our requirements
  if (generatedQuestion.length < 5) {
    generatedQuestion = `What is ${quizName} about?`;
  }

  return { question: generatedQuestion };
}

/**
 * Updates an existing question in a quiz.
 *
 * @param {number} userId - The ID of the user updating the question
 * @param {number} quizId - The ID of the quiz containing the question
 * @param {number} questionId - The ID of the question to update
 * @param {questionsInterface} questionBody - The new question details
 *
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminQuizQuestionUpdate(
  userId: number,
  quizId: number,
  questionId: number,
  questionBody: questionsInterface
): Record<string, never> {
  const data = getData();

  const userFound = data.users.some((user: userInterface) => user.userId === userId);
  if (!userFound) {
    throw new BetterError(
      Errors.invalidUser().error,
      ErrorCodes.BADREQUEST
    );
  }

  const quiz = findQuizByUser(userId, quizId);

  const questionIndex = quiz.questions.findIndex(
    (question: questionsInterface) => question.questionId === questionId
  );
  if (questionIndex === -1) {
    throw new BetterError(
      Errors.invalidQuestion().error,
      ErrorCodes.BADREQUEST
    );
  }

  const { question, timeLimit, points, answerOptions } = questionBody;

  validQuestionString(question);

  validateAnswers(answerOptions);
  if (timeLimit <= 0) {
    throw new BetterError(
      Errors.invalidString('Time limit', Errors.Specific.Time.POSITIVE).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks that the time limit of quiz does not exceed 3 minutes after updating
  const totalTime = quiz.questions.reduce(
    (sum: number, q: questionsInterface) => sum + q.timeLimit, 0) -
    quiz.questions[questionIndex].timeLimit +
    timeLimit;
  if (totalTime > 180) {
    throw new BetterError(
      Errors.invalidString('Total time limit', Errors.Specific.Time.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }

  validatePoints(points);

  let answerId = 0;
  const updatedAnswerOptions = answerOptions.map((option: answersInterface) => {
    answerId++;
    return {
      ...option,
      id: answerId,
      colour: randomColour(),
    };
  });

  // Update the question
  quiz.questions[questionIndex] = {
    questionId,
    question,
    timeLimit,
    points,
    answerOptions: updatedAnswerOptions
  };

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  quiz.timeLimit = totalTime;

  return {};
}

export function adminQuizQuestionUpdateV2(
  userId: number,
  quizId: number,
  questionId: number,
  questionBody: questionsInterface
): Record<string, never> {
  const thumbnailUrl = questionBody.thumbnailUrl.toLowerCase();

  // Validate thumbnail
  if (thumbnailUrl === '') {
    throw new BetterError(
      Errors.invalidString('Thumbnail', Errors.Specific.Thumbnail.EMPTY).error,
      ErrorCodes.BADREQUEST
    );
  }

  if (!thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
    throw new BetterError(
      Errors.invalidString('Thumbnail', Errors.Specific.Thumbnail.START).error,
      ErrorCodes.BADREQUEST
    );
  }

  if (!thumbnailUrl.endsWith('jpg') &&
    !thumbnailUrl.endsWith('jpeg') &&
    !thumbnailUrl.endsWith('png')) {
    throw new BetterError(
      Errors.invalidString('Thumbnail', Errors.Specific.Thumbnail.END).error,
      ErrorCodes.BADREQUEST
    );
  }

  const v1 = adminQuizQuestionUpdate(userId, quizId, questionId, questionBody);

  const quiz = findQuizByUser(userId, quizId);

  const question = quiz.questions.find(
    (q: questionsInterface) => q.questionId === questionId
  );

  question.thumbnailUrl = questionBody.thumbnailUrl;

  return v1;
}
