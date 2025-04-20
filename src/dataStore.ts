import { quizStates } from './functionsHelper';

/**
 * Interface representing the users.
 *
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
export interface userInterface {
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
 * Interface representing the answers inside the questions.
 *
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
 * Interface representing the questions inside the quiz.
 *
 * @typedef {Object} questionsInterface
 *
 * @property {number} [questionId] - Unique identifier for the question (optional)
 * @property {string} question - The question text
 * @property {number} timeLimit - Time limit to answer in seconds
 * @property {number} points - Points awarded for correct answer
 * @property {answersInterface[]} answerOptions - Available answer options
 * @property {string} thumbnailUrl - The url of the thumbnail
 */
export interface questionsInterface {
  questionId?: number;
  question: string;
  timeLimit: number;
  points: number;
  answerOptions: answersInterface[];
  thumbnailUrl?: string;
}

/**
 * Interface representing the quizzes.
 *
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
export interface quizInterface {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  createdBy: number;
  numQuestions: number;
  questions: questionsInterface[];
  timeLimit: number;
  thumbnailUrl?: string;
}

/**
 * Interface representing the active sessions.
 *
 * @typedef {Object} sessionInterface
 *
 * @property {number} userId - User ID associated with the session
 * @property {string} session - Session token
 */
export interface sessionInterface {
  userId: number;
  session: string;
}

export interface usersRankedByScoreInterface {
  playerName: string,
  score: number
}

export interface questionResultsInterface {
  questionId: Number,
  playersCorrect: string[],
  averageAnswerTime: Number,
  percentCorrect: Number
}

export interface resultsInterface {
  usersRankedByScore: usersRankedByScoreInterface[];
  questionResults: questionResultsInterface[];
}

export interface gameInterface {
  gameId?:number;
  quizId?: number;
  state: quizStates;
  atQuestion: number;
  players: string[];
  metadata: quizInterface;
  autoStartNum?: number;
  results: resultsInterface;
}

/**
 * Interface representing the data store of this program.
 *
 * @typedef {Object} Data
 *
 * @property {userInterface[]} users - Array of all users
 * @property {quizInterface[]} quizzes - Array of all quizzes
 * @property {number} highestID - Highest ID in the system
 * @property {sessionInterface[]} sessions - Array of active sessions
 */
export interface Data {
  users: userInterface[];
  quizzes: quizInterface[];

  highestID: number;
  sessions: sessionInterface[];
  games: gameInterface[];

  activeTimers: Record<number, ReturnType<typeof setTimeout>>;
}

/**
 * The data store.
 * @type {Data}
 */
const data: Data = {
  users: [],
  quizzes: [],

  highestID: 0,
  sessions: [],
  games: [],

  activeTimers: {}
};

/**
 * Gets the current state of the application data store.
 *
 * @returns {Data} - The entire data store object
 */
export function getData(): Data {
  return data;
}
