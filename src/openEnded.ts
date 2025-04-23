import {
  convertToCSV,
  getCurrentTimestamp,
  findQuizByUser,
  BetterError,
  ErrorCodes,
  createUUID,
  Errors,
  quizStates,
  errorInterface
} from './functionsHelper';
import {
  adminQuizCreate,
  adminQuizQuestionCreateV2,
  adminQuizThumbnailUpdate
} from './quiz';
import { playerFinalResults } from './player';
import {
  quizInterface,
  getData
} from './dataStore';

import fs from 'fs';
import request from 'sync-request-curl';

// Directory paths for storing generated files
const CSV_PATH = './csvResults';
const JSON_PATH = './jsonFiles';

// Create directories if they don't exist
if (!fs.existsSync(CSV_PATH)) {
  fs.mkdirSync(CSV_PATH);
}

if (!fs.existsSync(JSON_PATH)) {
  fs.mkdirSync(JSON_PATH);
}

/**
 * Generates CSV files from quiz results and saves them to disk
 * @param playerId - ID of the player requesting results
 * @param quizId - ID of the quiz to process
 * @param userId - ID of the user owning the quiz
 * @returns Combined CSV data as string
 */
export function createCSV(
  playerId: number,
  quizId: number,
  userId: number
) {
  findQuizByUser(userId, quizId);

  const result = playerFinalResults(playerId);

  // Convert results to CSV format
  const usersScore = convertToCSV(result.usersRankedByScore);
  const questionResults = convertToCSV(result.questionResults);
  const combined = `usersRankedByScore\n${usersScore}\n\nquestionResults\n${questionResults}`;

  // Generate timestamp for unique filenames
  const time = getCurrentTimestamp();

  // Write files to CSV directory
  fs.writeFileSync(`${CSV_PATH}/usersRankedByScore_${playerId}_${time}.csv`, usersScore);
  fs.writeFileSync(`${CSV_PATH}/questionResults_${playerId}_${time}.csv`, questionResults);
  fs.writeFileSync(`${CSV_PATH}/combined_${playerId}_${time}.txt`, combined);

  return combined;
}

/**
 * Exports quiz data to JSON file format
 * @param quizId - ID of the quiz to export
 * @param userId - ID of the user owning the quiz
 * @returns Object containing exported JSON and filename
 */
export function exportJSON(
  quizId: number,
  userId: number
) {
  const quiz = findQuizByUser(userId, quizId);

  // Structure quiz data for export
  const newJSON = {
    name: quiz.name,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    timeLimit: quiz.timeLimit,
    thumbnailUrl: quiz.thumbnailUrl || ''
  };

  // Generate timestamp for unique filename
  const time = getCurrentTimestamp();

  // Write JSON file to disk
  fs.writeFileSync(`${JSON_PATH}/${quiz.name}_${time}.json`, JSON.stringify(newJSON, null, 2));

  return { newJSON, file: `${quiz.name}_${time}.json` };
}

/**
 * Imports quiz data from JSON file
 * @param file - Filename to import from JSON_PATH directory
 * @param userId - ID of the user importing the quiz
 * @returns Object containing new quiz ID
 */
export function importJSON(
  file: string,
  userId: number
) {
  let quizId = createUUID();

  try {
    // Read and parse JSON file
    const jsonData = JSON.parse(
      fs.readFileSync(`${JSON_PATH}/${file}`).toString()
    ) as quizInterface;

    // Create new quiz from imported data
    quizId = adminQuizCreate(userId, jsonData.name, jsonData.description).quizId;

    // Add questions from imported data
    for (const question of jsonData.questions) {
      adminQuizQuestionCreateV2(userId, quizId, question);
    }

    // Add thumbnail if present
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

/**
 * Manages quiz attachments
 * @param userId - ID of the user owning the quiz
 * @param quizId - ID of the quiz to modify
 * @param attachment - Attachment string to add
 * @returns Empty object
 */
export function attachments(
  userId: number,
  quizId: number,
  attachment: string
) {
  const quiz = findQuizByUser(userId, quizId);

  // Add new attachment to quiz
  quiz.attachments.push(attachment);

  return {};
}

/**
 * Retrieves specific quiz attachment
 * @param userId - ID of the user owning the quiz
 * @param quizId - ID of the quiz to access
 * @param attachmentNumber - Index of attachment to retrieve
 * @returns Requested attachment string
 * @throws BetterError if invalid attachment number
 */
export function seeAttachments(
  userId: number,
  quizId: number,
  attachmentNumber: number
) {
  const quiz = findQuizByUser(userId, quizId);

  // Validate attachment index
  if (!quiz.attachments || attachmentNumber < 0 || attachmentNumber >= quiz.attachments.length) {
    throw new BetterError(
      Errors.invalidAttachmentNumber().error,
      ErrorCodes.BADREQUEST
    );
  }

  return quiz.attachments[attachmentNumber];
}

/**
 * Generates AI-powered hint for current question
 * @param {number} playerId - ID of the player requesting hint
 * @param {string} HUGGINGFACE_API_TOKEN - API token for AI service
 * @returns {string | errorInterface} geberatedHint - Generated hint string or error
 * object if there is error
 */
export function hint(
  playerId: number,
  HUGGINGFACE_API_TOKEN: string
) {
  const data = getData();

  // Find game containing player
  const game = data.games.find(g =>
    g.playersWithId?.some(p => p.playerId === playerId)
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Validate game state
  if (game.state !== quizStates.QUESTION_OPEN) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Get current question and correct answer
  const currentQuestion = game.atQuestion;
  const question = game.metadata.questions[currentQuestion - 1].question;
  const answer = game.metadata.questions[currentQuestion - 1].answerOptions.find(
    option => option.correct
  ).answer;

  // Construct AI prompt
  const prompt = `You are a helpful assistant that only gives hints. 
  Please give a hint for the following question but not the answer:
  
  Question: "${question}"
  Answer: "${answer}"
  
  The hint should be relevant to the question and answer, clear, and concise. 
  The hint should be between 5 and 50 characters.
  
  Respond with just the hint, nothing else.`;

  // Make API request to AI service
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

  // Handle API errors
  if ('error' in responseBody) {
    throw new BetterError(
      { error: responseBody.error }.error,
      ErrorCodes.BADREQUEST
    );
  }

  // Extract and return generated hint
  const generatedHint = responseBody[0].generated_text.slice(prompt.length);

  return generatedHint;
}

/**
 * Translates quiz question using AI service
 * @param {number} playerId - ID of the player requesting translation
 * @param {string} language - Target language for translation
 * @param {string} HUGGINGFACE_API_TOKEN - API token for AI service
 * @returns {string | errorInterface} generatedTranslation - Translated question string, 
 * or error object if there is error
 */
export function translate(
  playerId: number,
  language: string,
  HUGGINGFACE_API_TOKEN: string
) {
  const data = getData();

  // Find game containing player
  const game = data.games.find(g =>
    g.playersWithId?.some(p => p.playerId === playerId)
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Validate game state
  if (game.state !== quizStates.QUESTION_OPEN) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Get current question
  const currentQuestion = game.atQuestion;
  const question = game.metadata.questions[currentQuestion - 1].question;

  // Construct translation prompt
  const prompt = `You are a helpful assistant that only does translation. 
  Please translate the following question into the following language:

  Question: "${question}"
  language: "${language}"

  The translation should be word for word and accurate to the original language. 
  
  Respond with just the translation, nothing else.`;

  // Make API request to AI service
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

  // Handle API errors
  if ('error' in responseBody) {
    throw new BetterError(
      { error: responseBody.error }.error,
      ErrorCodes.BADREQUEST
    );
  }

  // Extract and return translation
  const generatedTranslate = responseBody[0].generated_text.slice(prompt.length);

  return generatedTranslate;
}

/**
 * Generates AI-powered explanation for quiz answers
 * @param {number} playerId - ID of the player requesting explanation
 * @param {string} HUGGINGFACE_API_TOKEN - API token for AI service
 * @returns {string | errorInterface} generated hint - Generated explanation string
 * or throws error is there is error
 */
export function explain(
  playerId: number,
  HUGGINGFACE_API_TOKEN: string
) {
  const data = getData();

  // Find game containing player
  const game = data.games.find(g =>
    g.playersWithId?.some(p => p.playerId === playerId)
  );

  if (!game) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Validate game state
  if (game.state !== quizStates.ANSWER_SHOW) {
    throw new BetterError(
      Errors.invalidPlayer().error,
      ErrorCodes.BADREQUEST
    );
  }

  // Get current question and correct answers
  const currentQuestion = game.atQuestion;
  const question = game.metadata.questions[currentQuestion - 1].question;
  const correctAnswers = game.metadata.questions[currentQuestion - 1].answerOptions
    .filter(option => option.correct)
    .map(option => option.answer);
  const answer = correctAnswers.join(', ');

  // Construct explanation prompt
  const prompt = `You are a helpful assistant that explains. 
  Please explain the answer(s) for the following question:

  Question: "${question}"
  Answer(s): "${answer}"

  The explanation should be relevant to the question and answer, clear, and concise. 
  The explanation should be between 5 and 100 characters.

  Respond with just the explanation, nothing else.`;

  // Make API request to AI service
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

  // Handle API errors
  if ('error' in responseBody) {
    throw new BetterError(
      { error: responseBody.error }.error,
      ErrorCodes.BADREQUEST
    );
  }

  // Extract and return explanation
  const generatedHint = responseBody[0].generated_text.slice(prompt.length);

  return generatedHint;
}
