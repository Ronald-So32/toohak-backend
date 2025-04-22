import {
  convertToCSV,
  getCurrentTimestamp,
  findQuizByUser,
  BetterError,
  ErrorCodes,
  createUUID,
  Errors,
  quizStates
} from './functionsHelper';
import {
  adminQuizCreate,
  adminQuizQuestionCreateV2,
  adminQuizQuestionCreate,
  adminQuizThumbnailUpdate
} from './quiz'
import { playerFinalResults } from './player';
import {
  quizInterface,
  getData
} from './dataStore';

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
  playerId: number,
  HUGGINGFACE_API_TOKEN: string
) {
  const data = getData();

  const game = data.games.find(g =>
    g.playersWithId?.some(p => p.playerId === playerId)
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (game.state !== quizStates.QUESTION_OPEN) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  const currentQuestion = game.atQuestion;
  const question = game.metadata.questions[currentQuestion - 1].question;
  const answer = game.metadata.questions[currentQuestion - 1].answerOptions.find(
    option => option.correct
  ).answer;

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

  let generatedHint = responseBody[0].generated_text.slice(prompt.length);

  return generatedHint;
}

export function translate(
  playerId: number,
  language: string,
  HUGGINGFACE_API_TOKEN: string
) {
  const data = getData();

  const game = data.games.find(g =>
    g.playersWithId?.some(p => p.playerId === playerId)
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  if (game.state !== quizStates.QUESTION_OPEN) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  const currentQuestion = game.atQuestion;
  const question = game.metadata.questions[currentQuestion - 1].question;

  const prompt = `You are a helpful assistant that only does translation. 
  Please translate the following question into the following language:

  Question: "${question}"
  language: "${language}"

  The translation should be word for word and accurate to the original language. 
  
  Respond with just the translation, nothing else.`;

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

  let generatedTranslate = responseBody[0].generated_text.slice(prompt.length);

  return generatedTranslate;
}
