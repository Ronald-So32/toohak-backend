import { getData } from './dataStore';

import { v4 as uuidv4 } from 'uuid';

/**
 * A instance of this object:
 * {
 *    error: error message,
 * }
 *
 * @typedef {object} error - Object containing just the error message
 *
 * @property {string} error - Error message relevant to the problem
 */
export interface errorInterface {
  error: string;
}

/**
 * A instance of this object:
 * {
 *    userId: 1,
 * }
 *
 * @typedef {object} userId - Object containing just the user Id
 *
 * @property {number} userId - Id of user
 * @property {string} 
 */
export interface userIdInterface {
  userId: number;
  session: string;
}

/**
 * A instance of this object:
 * {
 *    quizId: 1,
 * }
 *
 * @typedef {object} quizId - Object containing just the user Id
 *
 * @property {number} quizId - Id of user
 */
export interface quizIdInterface {
  quizId: number;
}

/**
 * A instance of this object:
 *{
    quizId: 1,
    name: 'My Quiz',
  }
 *
 * @typedef {object} quizzes - Data structure containing an array of
 * quiz summaries
 *
 * @property {number} quizId - Id of the quiz
 * @property {string} name - Full name of the quiz
 */
export interface quizSummariesInterface {
  quizId: number;
  name: string;
}

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
 * @typedef {object} quiz - Data structure containing the details of the quiz
 *
 * @property {number} quizId - Id of the quiz
 * @property {string} name - F6ull name of the quiz
 * @property {number} timeCreated - Time created of the quiz
 * @property {number} timeLastEdited - Time of the last edit made to the quiz
 * @property {string} description - Description of the quiz
 */
export interface quizDetailsInterface {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
}

/**
 * A instance of this object:
 * {
 *    userId: 1,
 *    name: 'Hayden Smith',
 *    email: 'hayden.smith@unsw.edu.au',
 *    numSuccessfulLogins: 3,
 *    numFailedPasswordsSinceLastLogin: 1,
 * }
 *
 * @typedef {object} user - Data structure containing the details of the user
 *
 * @property {number} userId - Id of the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address of the user
 * @property {number} numSuccessfulLogins - The number of times that the user
 * logs in successfully
 * @property {number} numFailedPasswordsSinceLastLogin - The number of failed
 * login attempts by the user since the last login
 */
export interface userDetailsInterface {
  userId: number;
  name: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

/**
 * Creates a unique user id from the current registered users
 *
 * @returns {number} - Returns the created uuid
 */
export function createUUID(): number {
  const data = getData();

  data.highestID += 1;

  return data.highestID;
}

/**
 * Validates the name the first or last name the user intends to use for their account
 *
 * @param {string} name - The first or the last name of the user
 * @param {boolean} isFirst - Whether or not it is the user's first name
 *
 * @returns {boolean | error} - Returns true for a valid name else returns
 * an object with relevant error message
 */

export function validName(name: string, isFirst: boolean): boolean | errorInterface {
  // Checks if there is lesser than 2 characters in the name
  if (name.length < 2) {
    if (isFirst) {
      return { error: 'First name is shorter than 2 characters' };
    } else {
      return { error: 'Last name is shorter than 2 characters' };
    }
  }
  // Checks if there is more than 20 characters in the name
  if (name.length > 20) {
    if (isFirst) {
      return { error: 'First name is longer than 20 characters' };
    } else {
      return { error: 'Last name is longer than 20 characters' };
    }
  }
  // Checks if the name has invalid characters
  if (name.search(/[^a-zA-Z\s-']/) !== -1) {
    if (isFirst) {
      return {
        error: 'First name contains characters other than lowercase letters, ' +
        'uppercase letters, spaces, hyphens, or apostrophes'
      };
    } else {
      return {
        error: 'Last name contains characters other than lowercase letters, ' +
        'uppercase letters, spaces, hyphens, or apostrophes'
      };
    }
  }

  return true;
}

/**
 * Validate the password that the user intends to use for their account
 *
 * @param {string} password - Intended password of user
 * @returns {boolean | error} - Retursn true for valid password else an
 * object with relevant error message
 */
export function validPassword(password: string): boolean | errorInterface {
  // Checks if the length of the password is lesser than 8
  if (password.length < 8) {
    return { error: 'Password is shorter than 8 characters' };
  }

  // Check if newPassword contains at least one letter and one number
  const passwordLetter = password.search(/[a-zA-Z]/);
  const passwordNumber = password.search(/\d/);
  if (passwordLetter === -1 || passwordNumber === -1) {
    return { error: 'Password does not contain at least one number and at least one letter' };
  }

  return true;
}

/**
 * Validates the name that the user intends to use for their quiz
 *
 * @param {string} name - Intended quiz name user wants
 * @returns {boolean | error} - Returns true for valid quiz name else an
 * object with relevant error message
 */
export function validQuizName(name: string): boolean | errorInterface {
  // Checks if the quiz name contains special character
  if (name.match(/[^a-zA-Z0-9\s]/) !== null) {
    return { error: 'Quiz name contains special characters' };
  }
  // Checks if the quiz name has less than 3
  if (name.length < 3) {
    return { error: 'Quiz name is lesser than 3' };
  }
  // Checks if the quiz name has more than 30
  if (name.length > 30) {
    return { error: 'Quiz name is greater than 30' };
  }

  return true;
}

export function generateSession(): string {
  const data = getData();
  let sessionNew = uuidv4();

  while (data.sessions.some(sessionObj => sessionObj.session === sessionNew)) {
    sessionNew = uuidv4();
  }
  
  return sessionNew;
}