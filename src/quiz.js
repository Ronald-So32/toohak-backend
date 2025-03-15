import { getData } from './dataStore.js';
import { createUUID, validQuizName } from './helper.js';

/**
 * A instance of this object:
 * {
 *    userId: 1,
 * }
 *
 * @typedef {Object} userId - Object containing just the user Id
 *
 * @property {number} userId - Id of user
 */

/**
 * A instance of this object:
 *{
    quizId: 1,
    name: 'My Quiz',
  }
 *
 * @typedef {Object} quizzes - Data structure containing an array of
 * quiz summaries
 *
 * @property {number} quizId - Id of the quiz
 * @property {string} name - Full name of the quiz
 */

/**
 * A instance of this object:
 * {
 *    quizId: shdije28wjeheidjd,
 *    name: 'My Quiz',
 *    timeCreated: 1683125870,
 *    timeLastEdited: 1683125871,
 *    description: 'This is my quiz',
 * }
 *
 * @typedef {Object} quiz - Data structure containing the details of the quiz
 *
 * @property {number} quizId - Id of the quiz
 * @property {string} name - F6ull name of the quiz
 * @property {number} timeCreated - Time created of the quiz
 * @property {number} timeLastEdited - Time of the last edit made to the quiz
 * @property {string} description - Description of the quiz
 */

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  *
  * @param {number} userId - Id of the user
  * ...
  *
  * @returns {quizzes: [...]} - Always return quizzes object
*/
function adminQuizList(userId) {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return { error: `User Id of ${userId} is not valid` };
  }

  const quizzes = [];

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

export { adminQuizList };

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param {number} userId - Id of the user
  * @param {string} name - Name of quiz
  * @param {string} description - Description of quiz
  * ...
  *
  * @returns {quizId} - Always return quizId object
*/
function adminQuizCreate(userId, name, description) {
  const data = getData();

  let validUserId = false;

  for (const user of data.users) {
    if (user.userId === userId) {
      validUserId = true;
    }
  }

  if (validUserId === false) {
    return { error: 'UserId does not exist' };
  }

  const validName = validQuizName(name);
  if (validName !== true) {
    return validName;
  }

  for (const quiz of data.quizzes) {
    if (quiz.name === name && quiz.createdBy === userId) {
      return { error: 'Quiz name is already in use by the current logged in user for another quiz' };
    }
  }

  if (description.length > 100) {
    return { error: 'Quiz description is more than 100 characters' };
  }

  const id = createUUID();

  const timeStamp = Math.floor(Date.now() / 1000);

  // All details are correct so append new quiz to data.quizzes
  data.quizzes.push({
    quizId: id,
    name: name,
    timeCreated: timeStamp,
    timeLastEdited: timeStamp,
    description: description,
    createdBy: userId,
  });

  return {
    quizId: id
  };
}

export { adminQuizCreate };

/**
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
  * ...
  *
  * @returns {Object} - Always return an empty object
*/

function adminQuizRemove(userId, quizId) {
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

export { adminQuizRemove };
/**
  * Get all the relevant information about the current quiz.
  *
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
  * ...
  *
  * @returns {quiz} - Always return quiz object
*/

function adminQuizInfo(userId, quizId) {
  // Retrieve data from the data store
  const data = getData();

  // Check if user exists
  let userFound = false;
  for (const user of data.users) {
    if (user.userId === userId) {
      userFound = true;
    }
  }

  if (!userFound) {
    // Return error if user is not found
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

export { adminQuizInfo };

/**
  * Update the name of the relevant quiz.
  *
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
  * @param {string} name - Name of the quiz
  * ...
  *
  * @returns {Object} - Always return an empty object
*/
function adminQuizNameUpdate(userId, quizId, name) {
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

  const validName = validQuizName(name);
  if (validName !== true) {
    return validName;
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

export { adminQuizNameUpdate };

/**
  * Update the description of the relevant quiz.
  *
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
  * @param {string} description - Description of the quiz
  * ...
  *
  * @returns {Object} - Always return an empty object
*/
function adminQuizDescriptionUpdate(userId, quizId, description) {
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

export { adminQuizDescriptionUpdate };
