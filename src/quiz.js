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
    return {
        quizId: 2
    };
}

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