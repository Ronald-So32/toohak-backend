import {
  convertToCSV,
  getCurrentTimestamp,
  findQuizByUser,
  BetterError,
  ErrorCodes,
  createUUID
} from './functionsHelper';
import {
  adminQuizCreate,
  adminQuizQuestionCreateV2,
  adminQuizThumbnailUpdate
} from './quiz'
import { playerFinalResults } from './player';
import { quizInterface } from './dataStore';

import fs from 'fs';

const CSV_PATH = './csvResults';
const JSON_PATH = './jsonFiles'

export function createCSV(
  playerId: number,
  quizId: number,
  userId: number
) {
  findQuizByUser(userId, quizId);

  const result = playerFinalResults(playerId);

  const usersScore = convertToCSV(result.usersRankedByScore);
  const questionResults = convertToCSV(result.questionResults);
  const combined = `usersRankedByScore\n${usersScore}\n\nquestionResults\n${questionResults}`;

  const time = getCurrentTimestamp();

  try {
    fs.writeFileSync(`${CSV_PATH}/usersRankedByScore_${playerId}_${time}.csv`, usersScore);
    fs.writeFileSync(`${CSV_PATH}/questionResults_${playerId}_${time}.csv`, questionResults);
    fs.writeFileSync(`${CSV_PATH}/combined_${playerId}_${time}.csv`, combined);
  } catch (error) {
      throw new BetterError(
        error.message,
        ErrorCodes.BADREQUEST
      );
  }

  return combined;
}

export function exportJSON(
  quizId: number,
  userId: number
) {
  const quiz = findQuizByUser(userId, quizId);

  const newJSON = {
    name: quiz.name,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    timeLimit: quiz.timeLimit,
    thumbnailUrl: quiz.thumbnailUrl || ''
  }
  
  const time = getCurrentTimestamp();

  try {
    fs.writeFileSync(`${JSON_PATH}/${quiz.name}_${time}.json`, JSON.stringify(newJSON, null, 2));
  } catch (error) {
    throw new BetterError(
      error.message,
      ErrorCodes.BADREQUEST
    );
  }

  return JSON.stringify(newJSON, null, 2);
}

export function importJSON(
  file: string,
  userId: number
) {
  const jsonData = JSON.parse(fs.readFileSync(`${JSON_PATH}/${file}`).toString()) as quizInterface;

  let quizId = createUUID();

  try {
    quizId = adminQuizCreate(userId, jsonData.name, jsonData.description).quizId;
  
    adminQuizQuestionCreateV2(userId, quizId, { questionBody: jsonData.questions });
  
    adminQuizThumbnailUpdate(jsonData.thumbnailUrl, quizId, userId);
  } catch (error) {
    throw new BetterError(
      error.message,
      ErrorCodes.BADREQUEST
    );
  }

  return { quizId };
}
