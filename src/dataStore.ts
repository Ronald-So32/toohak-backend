/**
 * @typedef {Object} userInterface
 *
 * @property {number} userId - Id for user
 * @property {string} nameFirst - User's first name
 * @property {string} nameLast - User's last name
 * @property {string} email - User's email address
 * @property {number} numSuccessfulLogins - Count of successful logins
 * @property {number} numFailedPasswordsSinceLastLogin - Count of failed password
 * attempts since last login
 * @property {string} password - The current password
 * @property {string[]} oldPasswords - History of old passwords
 */
interface userInterface {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  password: string;
  oldPasswords: string[];
}

/**
 * @typedef {Object} answersInterface
 *
 * @property {number} [answerId] - ID for the answer (optional)
 * @property {string} answer - The answer text
 * @property {string} [colour] - Display color for the answer (optional)
 * @property {boolean} correct - Whether this answer is correct
 */
export interface answersInterface {
  answerId?: number;
  answer: string;
  colour?: string;
  correct: boolean;
}

/**
 * @typedef {Object} questionsInterface
 *
 * @property {number} [questionId] - Unique identifier for the question (optional)
 * @property {string} question - The question text
 * @property {number} timeLimit - Time limit to answer in seconds
 * @property {number} points - Points awarded for correct answer
 * @property {answersInterface[]} answerOptions - Available answer options
 */
export interface questionsInterface {
  questionId?: number;
  question: string;
  timeLimit: number;
  points: number;
  answerOptions: answersInterface[];
}

/**
 * @typedef {Object} quizInterface
 *
 * @property {number} quizId - ID for the quiz
 * @property {string} name - Name of the quiz
 * @property {number} timeCreated - Timestamp when quiz was created
 * @property {number} timeLastEdited - Timestamp when quiz was last edited
 * @property {string} description - Description of the quiz
 * @property {number} createdBy - User ID of the quiz owner
 * @property {number} numQuestions - Number of questions in the quiz
 * @property {questionsInterface[]} questions - Array of questions in the quiz
 * @property {number} timeLimit - Total time limit for the quiz in seconds
 */
interface quizInterface {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  createdBy: number;
  numQuestions: number;
  questions: questionsInterface[];
  timeLimit: number;
}

/**
 * @typedef {Object} sessionInterface
 *
 * @property {number} userId - User ID associated with the session
 * @property {string} session - Session token
 */
interface sessionInterface {
  userId: number;
  session: string;
}

/**
 * @typedef {Object} Data
 *
 * @property {userInterface[]} users - Array of all users
 * @property {quizInterface[]} quizzes - Array of all quizzes
 * @property {number} highestID - Highest ID in the system
 * @property {sessionInterface[]} sessions - Array of active sessions
 */
interface Data {
  users: userInterface[];
  quizzes: quizInterface[];

  highestID: number;
  sessions: sessionInterface[];
}

/**
 * The data store
 * @type {Data}
 */
const data: Data = {
  users: [],
  quizzes: [],

  highestID: 0,
  sessions: []
};

/**
 * Gets the current state of the application data store
 *
 * @returns {Data} - The entire data store object
 */
export function getData(): Data {
  return data;
}
