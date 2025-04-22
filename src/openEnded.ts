import {
  convertToCSV,
  getCurrentTimestamp,
  findQuizByUser,
  BetterError,
  ErrorCodes,
  createUUID,
  Errors
} from './functionsHelper';
import {
  adminQuizCreate,
  adminQuizQuestionCreateV2,
  adminQuizQuestionCreate,
  adminQuizThumbnailUpdate
} from './quiz'
import { playerFinalResults } from './player';
import { quizInterface } from './dataStore';

import fs from 'fs';
import request from 'sync-request-curl';

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

  return { newJSON, file: `${quiz.name}_${time}.json` };
}

export function importJSON(
  file: string,
  userId: number
) {
  let quizId = createUUID();

  try {
    const jsonData = JSON.parse(fs.readFileSync(`${JSON_PATH}/${file}`).toString()) as quizInterface;

    quizId = adminQuizCreate(userId, jsonData.name, jsonData.description).quizId;
  
    try {
      adminQuizQuestionCreateV2(userId, quizId, { questionBody: jsonData.questions });
    } catch (error) {
      try {
        adminQuizQuestionCreate(userId, quizId, { questionBody: jsonData.questions });
      } catch (error) {
        
      }
    }

    if (jsonData.thumbnailUrl) {
      adminQuizThumbnailUpdate(jsonData.thumbnailUrl, quizId, userId);
    }
  } catch (error) {
    throw new BetterError(
      error.message,
      ErrorCodes.BADREQUEST
    );
  }

  return { quizId };
}

export function attachments(
  userId: number,
  quizId: number,
  attachment: string
) {
  const quiz = findQuizByUser(userId, quizId);

  quiz.attachments.push(attachment);

  return {};
}

export function seeAttachments(
  userId: number,
  quizId: number,
  attachmentNumber: number
) {
  const quiz = findQuizByUser(userId, quizId);

  if (!quiz.attachments || attachmentNumber < 0 || attachmentNumber >= quiz.attachments.length) {
    throw new BetterError(
      Errors.invalidAttachmentNumber().error,
      ErrorCodes.BADREQUEST
    );
  }

  return quiz.attachments[attachmentNumber];
}

export function hint(
  HUGGINGFACE_API_TOKEN: string
) {
  const question = "who is the best league of legends player"
  const answer = "faker"
  const prompt = `You are a helpful assistant that only gives hints. 
  Please give a hint for the following question but not the answer:
  
  Question: "${question}"
  Answer: "${answer}"
  
  The hint should be relevant to the question and answer, clear, and concise. 
  The hint should be between 5 and 50 characters.
  
  Respond with just the hint, nothing else.`;

  const response = request(
    'POST',
    'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
    {
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      json: {
        inputs: prompt
      }
    });

  const responseBody = JSON.parse(response.body.toString());

  if ('error' in responseBody) {
    throw new BetterError(
      { error: responseBody.error }.error,
      ErrorCodes.BADREQUEST
    );
  }

  let generatedQuestion = responseBody[0].generated_text;

  return generatedQuestion;
}
