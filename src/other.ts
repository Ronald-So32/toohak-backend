import { getData } from './dataStore.js';

/**
  * Reset the state of the application back to the start.
  *
  * @param {void} - No parameters
  *
  * @returns {Object} - Always return an empty object
*/
function clear() {
  const data = getData();

  data.users = [];
  data.quizzes = [];

  return {};
}

export { clear };
