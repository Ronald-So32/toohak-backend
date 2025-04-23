import {
  getData,
  questionsInterface,
  answersInterface,
  quizInterface,
  sessionInterface
} from './dataStore';

import { v4 as uuidv4 } from 'uuid';
import JSSHA from 'jssha';

/**
 * Interface representing an error object containing an error message.
 *
 * @typedef {object} errorInterface
 *
 * @property {string} error - Error message relevant to the problem
 */
export interface errorInterface {
  error: string;
}

/**
 * Interface representing a user ID and session token pair.
 *
 * @typedef {object} userIdInterface
 *
 * @property {number} userId - Id of user
 * @property {string} session - Authentication session token
 */
export interface userIdInterface {
  userId: number;
  session?: string;
}

/**
 * Interface representing a quiz ID.
 *
 * @typedef {object} quizIdInterface
 *
 * @property {number} quizId - Id of quiz
 */
export interface quizIdInterface {
  quizId: number;
}

/**
 * Interface representing a question ID.
 *
 * @typedef {object} questionIdInterface
 *
 * @property {number} questionId - Id of the question
 */
export interface questionIdInterface {
  questionId: number;
}

/**
 * Interface representing a game ID.
 *
 * @typedef {object} gameIdInterface
 *
 * @property {number} gameId - Id of the game
 */
export interface gameIdInterface {
  gameId: number;
}

/**
 * Interface representing basic quiz summary information.
 *
 * @typedef {object} quizSummariesInterface
 *
 * @property {number} quizId - Id of the quiz
 * @property {string} name - Full name of the quiz
 */
export interface quizSummariesInterface {
  quizId: number;
  name: string;
}

/**
 * Interface representing detailed quiz information.
 *
 * @typedef {object} quizDetailsInterface
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
 * Interface representing detailed user information.
 *
 * @typedef {object} userDetailsInterface
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
 * Interface representing complete quiz details including questions.
 *
 * @typedef {object} quizGetDetailsInterface
 *
 * @property {object} details - Quiz details object
 * @property {number} details.quizId - ID of the quiz
 * @property {string} details.name - Name of the quiz
 * @property {number} details.timeCreated - Timestamp when quiz was created
 * @property {number} details.timeLastEdited - Timestamp of last edit
 * @property {string} details.description - Description of the quiz
 * @property {number} details.numQuestions - Count of questions in the quiz
 * @property {questionsInterface[]} details.questions - Array of question objects
 * @property {number} details.timeLimit - Time limit for the quiz in seconds
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
    thumbnailUrl?: string;
  }
}

export const idOffset: number = 727727;

export enum quizStates {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END'
}

export enum actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END'
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
    },
    Thumbnail: {
      EMPTY: 'cannot be an empty string',
      END: 'has to end with jpg, jpeg or png',
      START: 'has to begin with \'http://\' or \'https://\''
    },
    AutoStartNum: {
      TOO_LONG: 'must be at most 50'
    }
  } as const;

  // Error messages
  static readonly tooMuchGamesError = 'This quiz has 10 or more active game';
  static readonly gameRunningError = 'An active game still exists';
  static readonly noCorrectAnswersError = 'This Question has no correct answers';
  static readonly noPermissionError = 'User has no permissions to do this';
  static readonly noQuestionError = 'This quiz has no question';
  static readonly invalidSessionError = 'Invalid Session';
  static readonly invalidPasswordError = 'Invalid Password';
  static readonly invalidEmailError = 'Invalid Email';
  static readonly invalidQuizError = 'Invalid quiz ID';
  static readonly invalidUserError = 'Invalid user ID';
  static readonly invalidQuestionError = 'Invalid question ID';
  static readonly invalidActionError = 'Invalid action';
  static readonly invalidGameError = 'Invalid game';
  static readonly invalidPlayerNameError = 'Invalid player name';
  static readonly invalidPlayerError = 'Invalid player ID';
  static readonly invalidAnswerError = 'Invalid answer ID';
  static readonly invalidQuestionPositionError = 'Invalid question position';
  static readonly invalidAttachmentNumberError = 'Invalid attachment number';

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

  // Error when a game is running
  static gameRunning(): errorInterface {
    return { error: this.gameRunningError };
  }

  // Error when quiz has no question
  static noQuestion(): errorInterface {
    return { error: this.noQuestionError };
  }

  // Error when there is 10 or more games
  static tooMuchGames(): errorInterface {
    return { error: this.tooMuchGamesError };
  }

  // Error when action is invalid
  static invalidAction(): errorInterface {
    return { error: this.invalidActionError };
  }

  // Error when game is invalid
  static invalidGame(): errorInterface {
    return { error: this.invalidGameError };
  }

  // Error when player name is invalid
  static invalidPlayerName(): errorInterface {
    return { error: this.invalidPlayerNameError };
  }

  // Error when player ID is invalid
  static invalidPlayer(): errorInterface {
    return { error: this.invalidPlayerError };
  }

  // Error when question position is invalid
  static invalidQuestionPosition(): errorInterface {
    return { error: this.invalidQuestionPositionError };
  }

  // Error when answer ID is invalid
  static invalidAnswer(): errorInterface {
    return { error: this.invalidAnswerError };
  }

  // Error when attachment number is invalid
  static invalidAttachmentNumber(): errorInterface {
    return { error: this.invalidAttachmentNumberError };
  }
}

export enum ErrorCodes {
  OK = 200,
  BADREQUEST = 400,
  UNAUTHORISED = 401,
  FORBIDDEN = 403
}

export class BetterError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Creates a unique user id from the current registered users.
 *
 * @returns {number} - Returns the created uuid
 */
export function createUUID(): number {
  // Fetches the latest data from dataStore
  const data = getData();

  // Updates the highest id in the data
  data.highestID += 1;

  return data.highestID;
}

/**
 * Validates the name the first or last name the user intends to use for their account.
 *
 * @param {string} name - The first or the last name of the user
 * @param {boolean} isFirst - Whether or not it is the user's first name
 *
 * @returns {boolean | errorInterface} - Returns true for a valid name else returns
 * an object with relevant error message
 */
export function validName(name: string, isFirst: boolean): void {
  // Checks if there is lesser than 2 characters in the name
  if (name.length < 2) {
    if (isFirst) {
      throw new BetterError(
        Errors.invalidString('First name', Errors.Specific.Name.TOO_SHORT).error,
        ErrorCodes.BADREQUEST
      );
    } else {
      throw new BetterError(
        Errors.invalidString('Last name', Errors.Specific.Name.TOO_SHORT).error,
        ErrorCodes.BADREQUEST
      );
    }
  }
  // Checks if there is more than 20 characters in the name
  if (name.length > 20) {
    if (isFirst) {
      throw new BetterError(
        Errors.invalidString('First name', Errors.Specific.Name.TOO_LONG).error,
        ErrorCodes.BADREQUEST
      );
    } else {
      throw new BetterError(
        Errors.invalidString('Last name', Errors.Specific.Name.TOO_LONG).error,
        ErrorCodes.BADREQUEST
      );
    }
  }
  // Checks if the name has invalid characters
  if (name.search(/[^a-zA-Z\s-']/) !== -1) {
    if (isFirst) {
      throw new BetterError(
        Errors.invalidString('First name', Errors.Specific.Name.INVALID_CHARS).error,
        ErrorCodes.BADREQUEST
      );
    } else {
      throw new BetterError(
        Errors.invalidString('Last name', Errors.Specific.Name.INVALID_CHARS).error,
        ErrorCodes.BADREQUEST
      );
    }
  }
}

/**
 * Validate the password that the user intends to use for their account.
 *
 * @param {string} password - Intended password of user
 *
 * @returns {boolean | errorInterface} - Retursn true for valid password else an
 * object with relevant error message
 */
export function validPassword(password: string): void {
  // Checks if the length of the password is lesser than 8
  if (password.length < 8) {
    throw new BetterError(
      Errors.invalidString('Password', Errors.Specific.Password.TOO_SHORT).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Check if newPassword contains at least one letter and one number
  const passwordLetter = password.search(/[a-zA-Z]/);
  const passwordNumber = password.search(/\d/);
  if (passwordLetter === -1) {
    throw new BetterError(
      Errors.invalidString('Password', Errors.Specific.Password.NO_LETTER).error,
      ErrorCodes.BADREQUEST
    );
  }
  if (passwordNumber === -1) {
    throw new BetterError(
      Errors.invalidString('Password', Errors.Specific.Password.NO_NUMBER).error,
      ErrorCodes.BADREQUEST
    );
  }
}

/**
 * Validates the name that the user intends to use for their quiz.
 *
 * @param {string} name - Intended quiz name user wants
 *
 * @returns {boolean | errorInterface} - Returns true for valid quiz name else an
 * object with relevant error message
 */
export function validQuizName(name: string): void {
  // Checks if the quiz name contains special character
  if (name.match(/[^a-zA-Z0-9\s]/) !== null) {
    throw new BetterError(
      Errors.invalidString('Quiz name', Errors.Specific.Name.INVALID_CHARS).error,
      ErrorCodes.BADREQUEST
    );
  }
  // Checks if the quiz name has less than 3
  if (name.length < 3) {
    throw new BetterError(
      Errors.invalidString('Quiz name', Errors.Specific.Name.TOO_SHORT).error,
      ErrorCodes.BADREQUEST
    );
  }
  // Checks if the quiz name has more than 30
  if (name.length > 30) {
    throw new BetterError(
      Errors.invalidString('Quiz name', Errors.Specific.Name.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }
}

/**
 * Generates a unique session token using UUID v4.
 *
 * @returns {string} - The newly generated session token
 */
export function generateSession(): string {
  const data = getData();
  // Generates a session string using uuidv4
  let sessionNew = uuidv4();

  // Generates a new session string if it already exist
  while (data.sessions.some((sessionObj: sessionInterface) => sessionObj.session === sessionNew)) {
    sessionNew = uuidv4();
  }

  return sessionNew;
}

/**
 * Finds a user ID by their session token.
 *
 * @param {string} session - The session token to search for
 *
 * @returns {{userId: number} | errorInterface} - The user ID if found, otherwise an error
 */
export function findUserIdFromSession(session: string): userIdInterface {
  const data = getData();
  // Finds a session with the session string
  const theSession = data.sessions.find(
    (sessionObj: sessionInterface) => sessionObj.session === session
  );

  if (!theSession) {
    throw new BetterError(
      Errors.invalidSession().error,
      ErrorCodes.UNAUTHORISED
    );
  }

  return { userId: theSession.userId };
}

/**
 * Validates a question string according to length requirements.
 *
 * @param {string} question - The question text to validate
 *
 * @returns {boolean | errorInterface} - True if valid, otherwise an error object
 */
export function validQuestionString(question: string): void {
  // Checks if the length of question string is lesser then 5
  if (question.length < 5) {
    throw new BetterError(
      Errors.invalidString('Question name', Errors.Specific.Question.TOO_SHORT).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the length of question string is greater then 50
  if (question.length > 50) {
    throw new BetterError(
      Errors.invalidString('Question name', Errors.Specific.Question.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }
}

/**
 * Selects a random color from a predefined array.
 *
 * @returns {string} - The randomly selected color name
 */
export function randomColour(): string {
  // Define the colours
  const colors = [
    'red', // #FF0000
    'blue', // #0000FF
    'green', // #00FF00
    'yellow', // #FFFF00
  ];

  // Chooses a random colour
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

/**
 * Validates that points are within acceptable range.
 *
 * @param {number} points - The points value to validate
 *
 * @returns {boolean | errorInterface} - True if valid, otherwise an error object
 */
export function validatePoints(points: number): void {
  // Checks if the points is lesser then 1
  if (points < 1) {
    throw new BetterError(
      Errors.invalidString('Point', Errors.Specific.Points.TOO_SHORT).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the points is greater then 10
  if (points > 10) {
    throw new BetterError(
      Errors.invalidString('Point', Errors.Specific.Points.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }
}

/**
 * Validates that answer options meet quantity requirements.
 *
 * @param {answersInterface[]} answerOptions - Array of answer options to validate
 *
 * @returns {boolean | errorInterface} - True if valid, otherwise an error object
 */
export function validateAnswers(answerOptions: answersInterface[]): void {
  // Checks if the amount of answers is lesser then 2
  if (answerOptions.length < 2) {
    throw new BetterError(
      Errors.invalidString('Question', Errors.Specific.Answer.TOO_SHORT).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks if the amount of answers is greater then 6
  if (answerOptions.length > 6) {
    throw new BetterError(
      Errors.invalidString('Question', Errors.Specific.Answer.TOO_LONG).error,
      ErrorCodes.BADREQUEST
    );
  }

  // Checks each answer in the answerOptions of the question
  const answerStrings: string[] = [];
  let hasCorrectAnswer = false;

  for (const answer of answerOptions) {
    // Checks if the answer string is lesser then 1
    if (answer.answer.length < 1) {
      throw new BetterError(
        Errors.invalidString('Answer', Errors.Specific.AnswerString.TOO_SHORT).error,
        ErrorCodes.BADREQUEST
      );
    }
    // Checks if the answer string is greater then 30
    if (answer.answer.length > 30) {
      throw new BetterError(
        Errors.invalidString('Answer', Errors.Specific.AnswerString.TOO_LONG).error,
        ErrorCodes.BADREQUEST
      );
    }

    // Check for duplicate answers
    if (answerStrings.includes(answer.answer)) {
      throw new BetterError(
        Errors.invalidString('Answer', Errors.Specific.AnswerString.DUPLICATE).error,
        ErrorCodes.BADREQUEST
      );
    }
    answerStrings.push(answer.answer);

    // Checks if the question has a correct answer
    if (answer.correct) {
      hasCorrectAnswer = true;
    }
  }

  // Checks if there is a correct answer in the available options
  if (!hasCorrectAnswer) {
    throw new BetterError(
      Errors.noCorrectAnswers().error,
      ErrorCodes.BADREQUEST
    );
  }
}

/**
 * Generates a consistent timestamp in seconds for tracking edits and creation times.
 *
 * @returns {number} - Current timestamp in seconds since epoch
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Finds a quiz that's made by the given user through their quiz and user Ids
 *
 * @param {number} userId The user ID to search for
 * @param {number} quizId The quiz ID to search for
 *
 * @returns {quizInterface | errorInterface} - The detail of the quiz if found,
 * otherwise an error object
 */
export function findQuizByUser(userId: number, quizId: number): quizInterface {
  const data = getData();

  // Check if quizId exist
  const quiz = data.quizzes.find((quiz: quizInterface) => quiz.quizId === quizId);
  if (!quiz) {
    throw new BetterError(
      Errors.invalidQuiz().error,
      ErrorCodes.FORBIDDEN
    );
  }

  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    throw new BetterError(
      Errors.noPermission().error,
      ErrorCodes.FORBIDDEN
    );
  }

  return quiz;
}

export function hashString(password: string): string {
  const shaObj = new JSSHA('SHA-512', 'TEXT');
  shaObj.update(password);
  const hash = shaObj.getHash('HEX');

  return hash;
}


/**
 * Check active games in quiz with quizId
 *
 * @param {number} quizId - ID of quiz for checking active games in
 *
 * @returns {Record<string, never> | errorInterface} - Returns nothing if successful 
 * or error object if there is error
 */
export function checkActiveGames(quizId: number): void {
  const data = getData();

  // Check if there is a game running with this quiz that isn't END
  const activeGameExists = data.games.some(
    game => game.metadata.quizId === quizId && game.state !== quizStates.END
  );

  if (activeGameExists) {
    throw new BetterError(
      Errors.gameRunning().error,
      ErrorCodes.BADREQUEST
    );
  }
}

/**
 * Converts array of objects into a Comma-Separated(CSV) values formatted string.
 *
 * @param {any[]} arr - An array of objects 
 *
 * @returns {string} - CSV formatted string 
 */
export function convertToCSV(arr: any) {
  const array = [Object.keys(arr[0])].concat(arr);

  return array.map(it => {
    return Object.values(it).toString();
  }).join('\n');
}
