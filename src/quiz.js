import { getData } from './dataStore.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * A instance of this object:
 * {
 *    userId: 1,
 * }
 * 
 * @typedef {Object} userId - Object containing just the user Id
 * 
 * @property {string} userId - Id of user
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
 * @property {string} quizId - Id of the quiz
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
 * @property {string} quizId - Id of the quiz
 * @property {string} name - F6ull name of the quiz
 * @property {number} timeCreated - Time created of the quiz
 * @property {number} timeLastEdited - Time of the last edit made to the quiz
 * @property {string} description - Description of the quiz
 */

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  * 
  * @param {string} userId - Id of the user
  * ...
  * 
  * @returns {quizzes: [...]} - Always return quizzes object
*/
function adminQuizList(userId) {

  let data = getData();

  let userData;
  let userFound = false;
  
  for (const user of data.users) {
    if (user.userId === userId) {
      userData = user;
      userFound = true;
    }
  }

  if (!userFound) {
    return { error: `User Id of ${userId} is not valid` };
  }

  let quizzes = [];

  for (const quiz of data.quizzes) {
    if (quiz.createdBy === userId) {
      quizzes.push({
        quizId: quiz.quizId,
        name: quiz.name,
      }); 
    }
  }

  return {quizzes};
}

export { adminQuizList };

/**
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {string} userId - Id of the user
  * @param {string} name - Name of quiz
  * @param {string} description - Description of quiz
  * ...
  * 
  * @returns {quizId} - Always return quizId object
*/
function adminQuizCreate(userId, name, description) {
  let data = getData();

  let validUserId = false;

  for (const user of data.users) {
    if (user.userId === userId) {
      validUserId = true;
    }
  }

  if (validUserId === false) {;
    return { error: 'UserId does not exist' };
  }

  if (name === null) {
    return { error: 'A name is required'};
  }

  if (name.match(/[^\w\-\s]/) !== null) {
    return { error: 'Quiz name contains special characters' };
  }

  if (name.length < 3) {
    return { error: 'Quiz name is lesser than 3' };
  }
  
  if (name.length > 30) {
    return { error: 'Quiz name is greater than 30'} ;
  }

  for (const quiz of data.quizzes) {
    if (quiz.name === name && quiz.createdBy === userId) {
      return { error: 'Quiz name is already in use by the current logged in user for another quiz' };
    }
  }

  if (description.length > 100) {
    return { error: 'Quiz description is more than 100 characters'};
  }

  let id = uuidv4();
  let unique = false;

  const timeStamp = Math.floor(Date.now() / 1000)

  data.quizzes.push({
    quizId: id,
    name: name,
    timeCreated: timeStamp,
    timeLastEdited: timeStamp,
    description: description,
    createdBy: userId,
  })

  return {
    quizId: id
  };
}

export { adminQuizCreate };

/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {string} userId - Id of the user
  * @param {string} quizId - Id of the quiz
  * ...
  * 
  * @returns {Object} - Always return an empty object
*/
function adminQuizRemove(userId, quizId) {
    return {};
}

/**
  * Get all of the relevant information about the current quiz.
  * 
  * @param {string} userId - Id of the user
  * @param {string} quizId - Id of the quiz
  * ...
  * 
  * @returns {quiz} - Always return quiz object
*/
function adminQuizInfo(userId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    };
}

/**
  * Update the name of the relevant quiz.
  * 
  * @param {string} userId - Id of the user
  * @param {string} quizId - Id of the quiz
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
  
  // Check if name contains only alphanumerics and spaces
  const validNameRegex = /^[a-zA-Z0-9 ]+$/;
  if (!validNameRegex.test(name)) {
    return { error: 'Name contains invalid characters' };
  }
  
  // Check name length
  if (name.length < 3 || name.length > 30) {
    return { error: 'Name must be between 3 and 30 characters long' };
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
  * @param {string} userId - Id of the user
  * @param {string} quizId - Id of the quiz
  * @param {string} description - Description of the quiz
  * ...
  * 
  * @returns {Object} - Always return an empty object
*/
function adminQuizDescriptionUpdate (userId, quizId, description) {
    return {};
}
