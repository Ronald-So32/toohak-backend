import { getData } from './dataStore';
import fs from 'fs';

/**
 * Resets the application state to its initial empty state.
 * Clears all users, quizzes, sessions, and resets the highest ID counter.
 *
 * @returns {Record<string, never>} - Always returns an empty object indicating successful reset
 */
export function clear(): Record<string, never> {
  const data = getData();

  data.users = [];
  data.quizzes = [];

  data.highestID = 0;
  data.sessions = [];
  data.games = [];

  data.activeTimers = {};
  data.timerTimeCreated = [];

  fs.rmSync('./csvResults', { recursive: true, force: true });
  fs.rmSync('./jsonFiles', { recursive: true, force: true });
  return {};
}
