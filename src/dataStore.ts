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

export interface answersInterface {
  answerId?: number;
  answer: string;
  colour?: string;
  correct: boolean;
}

export interface questionsInterface {
  questionId?: number;
  question: string;
  timeLimit: number;
  points: number;
  answerOptions: answersInterface[];
}

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

interface sessionInterface {
  userId: number;
  session: string;
}

interface Data {
  users: userInterface[];
  quizzes: quizInterface[];

  highestID: number;
  sessions: sessionInterface[];
}

const data: Data = {
  users: [],
  quizzes: [],

  highestID: 0,
  sessions: []
};

// Use getData() to access the data
export function getData(): Data {
  return data;
}
