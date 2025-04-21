import {
  convertToCSV
} from './functionsHelper'
import {playerFinalResults} from './player'

export function createCSV(playerId: number) {
  const result = playerFinalResults(playerId);

  const usersScore = convertToCSV(result.usersRankedByScore);
  const questionResults = convertToCSV(result.questionResults);

  return `usersRankedByScore\n${usersScore}\n\nquestionResults\n${questionResults}`
}
