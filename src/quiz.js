import { getData } from './dataStore.js';

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
 *    quizId: 1,
 *    name: 'My Quiz',
 *    timeCreated: 1683125870,
 *    timeLastEdited: 1683125871,
 *    description: 'This is my quiz',
 * }
 * 
 * @typedef {Object} quiz - Data structure containing the details of the quiz
 * 
 * @property {number} quizId - Id of the quiz
 * @property {string} name - Full name of the quiz
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
    return { quizzes: [
        {
          quizId: 1,
          name: 'My Quiz',
        }
      ]
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

  let id;
  let unique = false;

  while (!unique) {
    id = Math.floor(Math.random() * 999999);
    unique = true;

    for (let quiz of data.quizzes) {
      if (quiz.quizId === id) {
        isUnique = false;
        break;
      }
    }

  }

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
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
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
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
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
  * @param {number} userId - Id of the user
  * @param {number} quizId - Id of the quiz
  * @param {string} name - Name of the quiz
  * ...
  * 
  * @returns {Object} - Always return an empty object
*/
function adminQuizNameUpdate(userId, quizId, name) {
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
  * @returns {Object} - Always return an empty object
*/
function adminQuizDescriptionUpdate (userId, quizId, description) {
    return {};
}