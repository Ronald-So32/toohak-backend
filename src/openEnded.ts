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
  
}

}

export function importJSON(
  quizId: number,
  userId: number
) {

}
