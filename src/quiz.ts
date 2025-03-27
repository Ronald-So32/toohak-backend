import {
  getData,
  questionsInterface
} from './dataStore';
import {
  createUUID,
  validQuizName,
  errorInterface,
  quizSummariesInterface,
  quizIdInterface,
  quizDetailsInterface,
  quizGetDetailsInterface,
  Errors
} from './functionsHelper';

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  *
  * @param {number} userId - Id of the user
  * ...
  *
  * @returns {{ quizzes: quizSummariesInterface[] } | errorInterface} - Always returns
  * an object, quizzes with an array of quizSummariesInterface inside of it unless
  * there is an error which returns errorInterface
*/
export function adminQuizList(
  userId: number
): { quizzes: quizSummariesInterface[] } | errorInterface {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  const quizzes: quizSummariesInterface[] = [];

  // Iterate through all quizzes and put in quizzes array if quiz is created by
  // user of passed in userId
  for (const quiz of data.quizzes) {
    if (quiz.createdBy === userId) {
      quizzes.push({
        quizId: quiz.quizId,
        name: quiz.name,
      });
    }
  }

  return { quizzes };
}

/**
  * TODO
  *
  * @param {number}
  * ...
  *
  * @returns
*/
export function adminQuizGet(
  userId: number,
  quizId: number
): quizGetDetailsInterface | errorInterface {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  const quiz = data.quizzes.find(
    (q) => q.quizId === quizId && q.createdBy === userId
  );

  if (!quiz) {
    return Errors.invalidQuiz();
  }

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

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param {number} userId - Id of the user
  * @param {string} name - Name of quiz
  * @param {string} description - Description of quiz
  * ...
  *
  * @returns {quizId | error} - Always return quizId object otherwise an
  * error object with relevant error message
*/
export function adminQuizCreate(
  userId: number,
  name: string,
  description: string
): quizIdInterface | errorInterface {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  const validName = validQuizName(name);
  if (validName !== true) {
    return validName as errorInterface;
  }

  const duplicate = data.quizzes.some(quiz => quiz.name === name && quiz.createdBy === userId);
  if (duplicate) {
    return { error: 'Quiz name is already in use by the current logged in user for another quiz' };
  }

  if (description.length > 100) {
    return { error: 'Quiz description is more than 100 characters' };
  }

  const id = createUUID();

  const timeStamp = Math.floor(Date.now() / 1000);

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
  * ...
  *
  * @returns {object} - Always return an empty object otherwise an
  * error object with relevant error message
*/

export function adminQuizRemove(
  userId: number,
  quizId: number
): Record<string, never> | errorInterface {
  // Retrieves data from the data store
  const data = getData();

  // Validates if the user exists
  const userExists = data.users.some(user => user.userId === userId);
  if (!userExists) {
    return { error: `User Id ${userId} is not valid` };
  }

  // Finds the quiz index of the quiz in the quizzes array
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  // Validates if the quiz exists
  if (quizIndex === -1) {
    return { error: `Quiz with Id ${quizId} does not exist` };
  }

  // Checks if the user owns the quiz
  const quiz = data.quizzes[quizIndex];
  if (quiz.createdBy !== userId) {
    return { error: 'You do not have permission to remove this quiz' };
  }

  // Removes the quiz from the quizzes array
  data.quizzes.splice(quizIndex, 1);

  return {};
}

/**
  * Get all the relevant information about the current quiz.
  *
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
  * ...
  *
  * @returns {quiz | error} - Always return quiz object otherwise an
  * error object with relevant error message
*/

export function adminQuizInfo(
  userId: number,
  quizId: number
): quizDetailsInterface | errorInterface {
  // Retrieve data from the data store
  const data = getData();

  // Check if user exists
  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return { error: `User Id of ${userId} is not valid` };
  }

  // Finds the quiz that matches both quizId and userId
  const quiz = data.quizzes.find(q => q.quizId === quizId && q.createdBy === userId);

  if (!quiz) {
    // Returns error if quiz is not found or not owned by user
    return { error: 'Quiz not found or not owned by user' };
  }

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
  * @param {string} name - Name of the quiz
  * ...
  *
  * @returns {object} - Always return an empty object otherwise an
  * error object with relevant error message
*/
export function adminQuizNameUpdate(
  userId: number,
  quizId: number,
  name: string
): Record<string, never> | errorInterface {
  const data = getData();

  // Check if userId is valid
  const user = data.users.find(user => user.userId === userId);
  if (!user) {
    return { error: 'Invalid user ID' };
  }

  // Check if quizId is valid
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return Errors.invalidQuiz();
  }

  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    return Errors.notOwner();
  }

  const validName = validQuizName(name);
  if (validName !== true) {
    return validName as errorInterface;
  }

  // Check if name is already used by the same user for another quiz
  const nameExists = data.quizzes.some(q =>
    q.createdBy === userId &&
    q.name === name &&
    q.quizId !== quizId
  );

  if (nameExists) {
    return { error: 'Name already used by this user for another quiz' };
  }

  // Update the quiz name
  quiz.name = name;

  // Update timeLastEdited
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return {};
}

/**
  * Update the description of the relevant quiz.
  *
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
  * @param {string} description - Description of the quiz
  * ...
  *
  * @returns {object} - Always return an empty object otherwise an
  * error object with relevant error message
*/
export function adminQuizDescriptionUpdate(
  userId: number,
  quizId: number,
  description: string
): Record<string, never> | errorInterface {
  const data = getData();

  // Check if userId is valid
  const user = data.users.find(user => user.userId === userId);
  if (!user) {
    return { error: 'Invalid user ID' };
  }

  // Check if quizId is valid
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return { error: 'Invalid quiz ID' };
  }

  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    return { error: 'User does not own this quiz' };
  }

  // Check if description length is valid (max 100 characters)
  if (description.length > 100) {
    return { error: 'Description is too long' };
  }

  // Update the quiz description
  quiz.description = description;

  // Update timeLastEdited
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return {};
}
