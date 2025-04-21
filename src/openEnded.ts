import {
  convertToCSV,
  getCurrentTimestamp,
  findQuizByUser
} from './functionsHelper';
import { playerFinalResults } from './player';

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

  fs.writeFileSync(`${CSV_PATH}/usersRankedByScore_${playerId}_${time}.csv`, usersScore);
  fs.writeFileSync(`${CSV_PATH}/questionResults_${playerId}_${time}.csv`, questionResults);
  fs.writeFileSync(`${CSV_PATH}/combined_${playerId}_${time}.csv`, combined);

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

  fs.writeFileSync(`${JSON_PATH}/${quiz.name}_${time}.json`, JSON.stringify(newJSON, null, 2));
}

export function importJSON(
  file: string,
  userId: number
) {

}
