import { getData } from './dataStore.ts';

/**
  * Reset the state of the application back to the start.
  *
  * @param {void} - No parameters
  *
  * @returns {Object} - Always return an empty object
*/
export function clear(): {} {
  const data = getData();

  data.users = [];
  data.quizzes = [];

  return {};
}