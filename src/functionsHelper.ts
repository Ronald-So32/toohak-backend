import {
  getData,
  questionsInterface
} from './dataStore';

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
 * {
 *    questionId: 1,
 * }
 *
 * @typedef {object} QuestionId - Object containing just the question Id
 *
 * @property {number} questionId - Id of the question
 */
export interface questionIdInterface {
  questionId: number;
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
 * A instance of this object:
 * {
 *
 *
 * @typedef {object}
 *
 * @property {number}
 */
export interface quizGetDetailsInterface {
  details: {
    quizId: number;
    name: string;
    timeCreated: number;
    timeLastEdited: number;
    description: string;
    numQuestions: number;
    questions: questionsInterface[];
    timeLimit: number;
  }
}

export class Errors {
  // Specific validation reasons
  static readonly Specific = {
    Name: {
      TOO_SHORT: 'must be at least 2 characters',
      TOO_LONG: 'must be at most 20 characters',
      INVALID_CHARS: 'contains invalid characters ' +
      '(Valid characters are letters, spaces, hyphens or apostrophes)'
    },
    Password: {
      TOO_SHORT: 'must be at least 8 characters',
      NO_LETTER: 'must contain at least one letter',
      NO_NUMBER: 'must contain at least one number',
      OLD_SAME: 'must be different than the previous passwords'
    },
    Description: {
      TOO_LONG: 'must be at most 100 characters'
    },
    QuizName: {
      TOO_SHORT: 'must be at least 3 characters',
      TOO_LONG: 'must be at most 30 characters',
      INVALID_CHARS: 'contains invalid characters ' +
      '(Valid characters are alphanumerics and spaces)',
      IN_USE: 'already in use by another quiz'
    },
    Position: {
      TOO_SHORT: 'cannot be less than 0',
      TOO_LONG: 'cannot be more than number of questions in the quiz',
      OLD_SAME: 'it cannot be the same'
    },
    Email: {
      SELF: 'targer user must not be yourself',
      NAME: 'target user already has a quiz with the same name'
    },
    Question: {
      TOO_SHORT: 'must be at least 5 characters',
      TOO_LONG: 'must be at most 50 characters',
    },
    Answer: {
      TOO_SHORT: 'must have at least 2 answers',
      TOO_LONG: 'must have at most 6 answer',
    },
    Time: {
      POSITIVE: 'must be a positive number',
      TOO_LONG: 'must have at most 3 minutes',
    },
    AnswerString: {
      TOO_SHORT: 'must be at least 1 characters',
      TOO_LONG: 'must be at most 30 characters',
      DUPLICATE: 'must not have any duplicates'
    },
    Points: {
      TOO_SHORT: 'must be at least 1',
      TOO_LONG: 'must be at most 10',
    }
  } as const;

  // Error messages
  static readonly noCorrectAnswersError = 'This Question has no correct answers';
  static readonly noPermissionError = 'User has no permissions to do this';
  static readonly invalidSessionError = 'Invalid Session';
  static readonly invalidPasswordError = 'Invalid Password';
  static readonly invalidEmailError = 'Invalid Email';
  static readonly invalidQuizError = 'Invalid quiz ID';
  static readonly invalidUserError = 'Invalid user ID';
  static readonly invalidQuestionError = 'Invalid question ID';

  // Error for invalid name
  static invalidString(type: string, specific: string): errorInterface {
    return { error: `${type} is invalid, ${specific}` };
  }

  // Error for invalid question ID
  static invalidQuestion(): errorInterface {
    return { error: this.invalidQuestionError };
  }

  // Error for invalid user ID
  static invalidUser(): errorInterface {
    return { error: this.invalidUserError };
  }

  // Error for invalid quiz ID
  static invalidQuiz(): errorInterface {
    return { error: this.invalidQuizError };
  }

  // Error for invalid email
  static invalidEmail(): errorInterface {
    return { error: this.invalidEmailError };
  }

  // Error for invalid password
  static invalidPassword(): errorInterface {
    return { error: this.invalidPasswordError };
  }

  // Error for invalid session
  static invalidSession(): errorInterface {
    return { error: this.invalidSessionError };
  }

  // Error for user with no permissions
  static noPermission(): errorInterface {
    return { error: this.noPermissionError };
  }

  // Error for no correct answers
  static noCorrectAnswers(): errorInterface {
    return { error: this.noCorrectAnswersError };
  }
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
      return Errors.invalidString('First name', Errors.Specific.Name.TOO_SHORT);
    } else {
      return Errors.invalidString('Last name', Errors.Specific.Name.TOO_SHORT);
    }
  }
  // Checks if there is more than 20 characters in the name
  if (name.length > 20) {
    if (isFirst) {
      return Errors.invalidString('First name', Errors.Specific.Name.TOO_LONG);
    } else {
      return Errors.invalidString('Last name', Errors.Specific.Name.TOO_LONG);
    }
  }
  // Checks if the name has invalid characters
  if (name.search(/[^a-zA-Z\s-']/) !== -1) {
    if (isFirst) {
      return Errors.invalidString('First name', Errors.Specific.Name.INVALID_CHARS);
    } else {
      return Errors.invalidString('Last name', Errors.Specific.Name.INVALID_CHARS);
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
    return Errors.invalidString('Passowrd', Errors.Specific.Password.TOO_SHORT);
  }

  // Check if newPassword contains at least one letter and one number
  const passwordLetter = password.search(/[a-zA-Z]/);
  const passwordNumber = password.search(/\d/);
  if (passwordLetter === -1) {
    return Errors.invalidString('Passowrd', Errors.Specific.Password.NO_LETTER);
  }
  if (passwordNumber === -1) {
    return Errors.invalidString('Passowrd', Errors.Specific.Password.NO_NUMBER);
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
    return Errors.invalidString('Quiz name', Errors.Specific.Name.INVALID_CHARS);
  }
  // Checks if the quiz name has less than 3
  if (name.length < 3) {
    return Errors.invalidString('Quiz name', Errors.Specific.Name.TOO_SHORT);
  }
  // Checks if the quiz name has more than 30
  if (name.length > 30) {
    return Errors.invalidString('Quiz name', Errors.Specific.Name.TOO_LONG);
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

export function findSessionFromUserId(userId: number): string | errorInterface {
  const data = getData();
  const theSession = data.sessions.find(sessionObj => sessionObj.userId === userId);

  if (!theSession) {
    return Errors.invalidSession();
  }

  return theSession.session;
}

export function findUserIdFromSession(session: string): { userId: number } | errorInterface {
  const data = getData();
  const theSession = data.sessions.find(sessionObj => sessionObj.session === session);

  if (!theSession) {
    return Errors.invalidSession();
  }

  return { userId: theSession.userId };
}

export function findQuestionIdInQuiz(quizId: number, questionId: number): Record<string, never> | errorInterface {
  const data = getData();
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);

  const questionExist = quiz.questions.find(question => question.questionId === questionId);
  if (!questionExist) {
    return Errors.invalidQuestion();
  }

  return {};
}

export function validQuestionString(question: string): boolean | errorInterface {
  if (question.length < 5) {
    return Errors.invalidString('Question name', Errors.Specific.Question.TOO_SHORT);
  }

  if (question.length > 50) {
    return Errors.invalidString('Question name', Errors.Specific.Question.TOO_LONG);
  }

  return true;
}

export function randomColour(): string {
  const colors = [
    'red', // #FF0000
    'blue', // #0000FF
    'green', // #00FF00
    'yellow', // #FFFF00
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

export function validatePoints(points: number): boolean | errorInterface {
  if (points < 1) {
    return Errors.invalidString('Point', Errors.Specific.Points.TOO_SHORT);
  }

  if (points > 10) {
    return Errors.invalidString('Point', Errors.Specific.Points.TOO_LONG);
  }

  return true;
}