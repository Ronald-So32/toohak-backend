import {
  getData,
  questionsInterface,
  answersInterface
} from './dataStore';
import {
  createUUID,
  validQuizName,
  errorInterface,
  quizSummariesInterface,
  quizIdInterface,
  quizDetailsInterface,
  quizGetDetailsInterface,
  questionIdInterface,
  Errors,
  validQuestionString,
  randomColour,
  validatePoints,
  validateAnswer,
  questionBodyInterface
} from './functionsHelper';

import request from 'sync-request-curl';

/**
 * Provides a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {number} userId - The ID of the user
 *
 * @returns {{ quizzes: quizSummariesInterface[] } | errorInterface} - Always returns
 * an object, quizzes with an array of quizSummariesInterface inside of it unless
 * there is an error which returns errorInterface
 */
export function adminQuizList(
  userId: number
): { quizzes: quizSummariesInterface[] } | errorInterface {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  const quizzes: quizSummariesInterface[] = [];

  // Iterate through all quizzes and put in quizzes array if quiz is created by
  // user of passed in userId
  for (const quiz of data.quizzes) {
    if (quiz.createdBy === userId) {
      quizzes.push({
        quizId: quiz.quizId,
        name: quiz.name,
      });
    }
  }

  return { quizzes };
}

/**
 * Retrieves all information about a specific quiz.
 *
 * @param {number} userId - The ID of the user requesting the quiz
 * @param {number} quizId - The ID of the quiz to retrieve
 *
 * @returns {quizGetDetailsInterface | errorInterface} - Returns either the quiz
 * details or an error object
 */
export function adminQuizGet(
  userId: number,
  quizId: number
): quizGetDetailsInterface | errorInterface {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  const quiz = data.quizzes.find(
    (q) => q.quizId === quizId && q.createdBy === userId
  );

  if (!quiz) {
    return Errors.invalidQuiz();
  }

  return {
    details: {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
      numQuestions: quiz.numQuestions,
      questions: quiz.questions,
      timeLimit: quiz.timeLimit,
    }
  };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {number} userId - Id of the user
 * @param {string} name - Name of the quiz
 * @param {string} description - Description of the quiz
 *
 * @returns {quizIdInterface | errorInterface} - Always return quizId object otherwise an
 * error object with relevant error message
 */
export function adminQuizCreate(
  userId: number,
  name: string,
  description: string
): quizIdInterface | errorInterface {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  const validName = validQuizName(name);
  if (validName !== true) {
    return validName as errorInterface;
  }

  const duplicate = data.quizzes.some(quiz => quiz.name === name && quiz.createdBy === userId);
  if (duplicate) {
    return Errors.invalidString('Quiz name', Errors.Specific.QuizName.IN_USE);
  }

  if (description.length > 100) {
    return Errors.invalidString('Quiz description', Errors.Specific.Description.TOO_LONG);
  }

  const id = createUUID();

  const timeStamp = Math.floor(Date.now() / 1000);

  const questionsArray: questionsInterface[] = [];

  // All details are correct so append new quiz to data.quizzes
  data.quizzes.push({
    quizId: id,
    name: name,
    timeCreated: timeStamp,
    timeLastEdited: timeStamp,
    description: description,
    createdBy: userId,
    numQuestions: 0,
    questions: questionsArray,
    timeLimit: 0,
  });

  return {
    quizId: id
  };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {number} userId - Id of the user
 * @param {number} quizId - Id of the quiz
 *
 * @returns {Record<string, never> | errorInterface} - Always return an empty
 * object otherwise an error object with relevant error message
 */
export function adminQuizRemove(
  userId: number,
  quizId: number
): Record<string, never> | errorInterface {
  // Retrieves data from the data store
  const data = getData();

  // Validates if the user exists
  const userExists = data.users.some(user => user.userId === userId);
  if (!userExists) {
    return Errors.invalidUser();
  }

  // Finds the quiz index of the quiz in the quizzes array
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);

  // Validates if the quiz exists
  if (quizIndex === -1) {
    return Errors.invalidQuiz();
  }

  // Checks if the user owns the quiz
  const quiz = data.quizzes[quizIndex];
  if (quiz.createdBy !== userId) {
    return Errors.noPermission();
  }

  // Removes the quiz from the quizzes array
  data.quizzes.splice(quizIndex, 1);

  return {};
}

/**
 * Get all the relevant information about the current quiz.
 *
 * @param {number} userId - Id of the user
 * @param {number} quizId - Id of the quiz
 *
 * @returns {quizDetailsInterface | errorInterface} - Always return quiz object
 * otherwise an error object with relevant error message
 */
export function adminQuizInfo(
  userId: number,
  quizId: number
): quizDetailsInterface | errorInterface {
  // Retrieve data from the data store
  const data = getData();

  // Check if user exists
  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  // Finds the quiz that matches both quizId and userId
  const quiz = data.quizzes.find(q => q.quizId === quizId && q.createdBy === userId);

  if (!quiz) {
    // Returns error if quiz is not found or not owned by user
    return Errors.invalidQuiz();
  }

  // Return quiz details if found
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description
  };
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {number} userId - Id of the user
 * @param {number} quizId - Id of the quiz
 * @param {string} name - The new name of the quiz
 *
 * @returns {Record<string, never> | errorInterface} - Always return an empty
 * object otherwise an error object with relevant error message
 */
export function adminQuizNameUpdate(
  userId: number,
  quizId: number,
  name: string
): Record<string, never> | errorInterface {
  const data = getData();

  // Check if userId is valid
  const user = data.users.find(user => user.userId === userId);
  if (!user) {
    return Errors.invalidUser();
  }

  // Check if quizId is valid
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return Errors.invalidQuiz();
  }

  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    return Errors.noPermission();
  }

  const validName = validQuizName(name);
  if (validName !== true) {
    return validName as errorInterface;
  }

  // Check if name is already used by the same user for another quiz
  const nameExists = data.quizzes.some(q =>
    q.createdBy === userId &&
    q.name === name &&
    q.quizId !== quizId
  );

  if (nameExists) {
    return Errors.invalidString('Quiz name', Errors.Specific.QuizName.IN_USE);
  }

  // Update the quiz name
  quiz.name = name;

  // Update timeLastEdited
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return {};
}

/**
 * Update the description of the relevant quiz.
 *
 * @param {number} userId - Id of the user
 * @param {number} quizId - Id of the quiz
 * @param {string} description - The new description of the quiz
 *
 * @returns {Record<string, never> | errorInterface} - Always return an empty
 * object otherwise an error object with relevant error message
 */
export function adminQuizDescriptionUpdate(
  userId: number,
  quizId: number,
  description: string
): Record<string, never> | errorInterface {
  const data = getData();

  // Check if userId is valid
  const user = data.users.find(user => user.userId === userId);
  if (!user) {
    return Errors.invalidUser();
  }

  // Check if quizId is valid
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return Errors.invalidQuiz();
  }

  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    return Errors.noPermission();
  }

  // Check if description length is valid (max 100 characters)
  if (description.length > 100) {
    return Errors.invalidString('Quiz description', Errors.Specific.Description.TOO_LONG);
  }

  // Update the quiz description
  quiz.description = description;

  // Update timeLastEdited
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return {};
}

/**
 * Creates a new question for a quiz.
 *
 * @param {number} userId - The ID of the user creating the question
 * @param {number} quizId - The ID of the quiz to add the question to
 * @param {questionBodyInterface} questionBody - The question details including
 * text, time limit, points, and answers
 * 
 * @returns {questionIdInterface | errorInterface} - Returns either the new question
 * ID or an error object
 */
export function adminQuizQuestionCreate(
  userId: number,
  quizId: number,
  questionBody: questionBodyInterface
): questionIdInterface | errorInterface {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return Errors.invalidQuiz();
  }

  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    return Errors.noPermission();
  }

  const { question, timeLimit, points, answerOptions } = questionBody.questionBody;

  // Validate question string
  const questionValidation = validQuestionString(question);
  if (questionValidation !== true) {
    return questionValidation as errorInterface;
  }

  // DO this in a helper instead
  if (answerOptions.length < 2) {
    return Errors.invalidString('Question', Errors.Specific.Answer.TOO_SHORT);
  }
  if (answerOptions.length > 6) {
    return Errors.invalidString('Question', Errors.Specific.Answer.TOO_LONG);
  }

  if (timeLimit <= 0) {
    return Errors.invalidString('Time limit', Errors.Specific.Time.POSITIVE);
  }

  const totalTime = quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) + timeLimit;
  if (totalTime > 180) {
    return Errors.invalidString('Total time limit', Errors.Specific.Time.TOO_LONG);
  }

  // Another helper
  if (points < 1) {
    return Errors.invalidString('Point', Errors.Specific.Points.TOO_SHORT);
  }
  if (points > 10) {
    return Errors.invalidString('Point', Errors.Specific.Points.TOO_LONG);
  }

  const answerStrings: string[] = [];
  let hasCorrectAnswer = false;

  for (const answer of answerOptions) {
    if (answer.answer.length < 1) {
      return Errors.invalidString('Answer', Errors.Specific.AnswerString.TOO_SHORT);
    }
    if (answer.answer.length > 30) {
      return Errors.invalidString('Answer', Errors.Specific.AnswerString.TOO_LONG);
    }

    // Check for duplicate answers
    if (answerStrings.includes(answer.answer)) {
      return Errors.invalidString('Answer', Errors.Specific.AnswerString.DUPLICATE);
    }
    answerStrings.push(answer.answer);

    if (answer.correct) {
      hasCorrectAnswer = true;
    }
  }

  if (!hasCorrectAnswer) {
    return Errors.noCorrectAnswers();
  }

  let answerId = 0;
  const updatedAnswerOptions = answerOptions.map((option: answersInterface) => {
    answerId++;
    return {
      ...option,
      id: answerId,
      colour: randomColour(),
    };
  });

  const id = createUUID();

  const newQuestion: questionsInterface = {
    questionId: id,
    question,
    timeLimit,
    points,
    answerOptions: updatedAnswerOptions
  };

  quiz.questions.push(newQuestion);
  quiz.timeLastEdited = Date.now();
  quiz.timeLimit += timeLimit;
  quiz.numQuestions += 1;

  return {
    questionId: id
  };
}

/**
 * Transfers ownership of a quiz to another user.
 *
 * @param {number} quizId - The ID of the quiz to transfer
 * @param {number} userId - The ID of the current owner
 * @param {string} userEmail - The email of the new owner
 * 
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminQuizTransfer(quizId: number, userId: number, userEmail: string) {
  const data = getData();

  // Check for the quiz
  const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (quizIndex === -1) {
    return Errors.invalidQuiz();
  }

  const quiz = data.quizzes[quizIndex];

  // Check for the user
  if (quiz.createdBy !== userId) {
    return Errors.noPermission();
  }

  // Check userEmail
  const targetUser = data.users.find(user => user.email === userEmail);
  if (!targetUser) {
    return Errors.invalidEmail();
  }

  // Target email is the same as self
  const currentUser = data.users.find(user => user.userId === userId);
  if (userEmail === currentUser.email) {
    return Errors.invalidString('User email', Errors.Specific.Email.SELF);
  }

  // Target user already has a quiz with the same name
  const nameConflict = data.quizzes.some(quizzes =>
    quizzes.createdBy === targetUser.userId && quiz.name === quizzes.name);
  if (nameConflict) {
    return Errors.invalidString('User email', Errors.Specific.Email.NAME);
  }

  data.quizzes[quizIndex].createdBy = targetUser.userId;

  return {};
}

/**
 * Deletes a question from a quiz.
 *
 * @param {number} quizId - The ID of the quiz containing the question
 * @param {number} userId - The ID of the user deleting the question
 * @param {number} questionId - The ID of the question to delete
 * 
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminDeleteQuizQuestion(
  quizId: number,
  userId: number,
  questionId: number
): Record<string, never> | errorInterface {
  const data = getData();

  // Check if userId is valid
  const user = data.users.find(user => user.userId === userId);
  if (!user) {
    return Errors.invalidUser();
  }

  // Check if quizId is valid
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return Errors.invalidQuiz();
  }

  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    return Errors.noPermission();
  }

  // Check if questionId is in given quiz
  const validQuestionIndex = quiz.questions.findIndex(
    question => question.questionId === questionId
  );
  if (validQuestionIndex === -1) {
    return Errors.invalidQuestion();
  }

  const deletedQuestion = quiz.questions[validQuestionIndex];

  quiz.timeLimit -= deletedQuestion.timeLimit;
  quiz.numQuestions -= 1;

  // Delete question from its questionId
  quiz.questions.splice(validQuestionIndex, 1);

  return {};
}

/**
 * Moves a question to a new position within a quiz.
 *
 * @param {number} quizId - The ID of the quiz containing the question
 * @param {number} userId - The ID of the user moving the question
 * @param {number} questionId - The ID of the question to move
 * @param {number} newPosition - The new position for the question
 * 
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminQuizQuestionMove(
  quizId: number,
  userId: number,
  questionId: number,
  newPosition: number
): Record<string, never> | errorInterface {
  const data = getData();

  // Check if userid is valid
  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  // Check if quizId is valid
  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return Errors.invalidQuiz();
  }

  // Check if user owns the quiz
  if (quiz.createdBy !== userId) {
    return Errors.noPermission();
  }

  // Check if questionId is in given quiz
  const validQuestionIndex = quiz.questions.findIndex(
    question => question.questionId === questionId
  );
  if (validQuestionIndex === -1) {
    return Errors.invalidQuestion();
  }

  // Position is less than 0
  if (newPosition < 0) {
    return Errors.invalidString('Position', Errors.Specific.Position.TOO_SHORT);
  }

  // Position greater than number of questions
  if (newPosition > quiz.numQuestions - 1) {
    return Errors.invalidString('Position', Errors.Specific.Position.TOO_LONG);
  }

  // Postion is the same as current positon of question
  if (validQuestionIndex === newPosition) {
    return Errors.invalidString('Position', Errors.Specific.Position.OLD_SAME);
  }

  const question = quiz.questions[validQuestionIndex];

  quiz.questions.splice(validQuestionIndex, 1);
  quiz.questions.splice(newPosition, 0, question);

  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return {};
}

/**
 * Generates a suggested question for a quiz using a LLM.
 *
 * @param {string} quizName - The name of the quiz
 * @param {string} quizDescription - The description of the quiz
 * @param {string} HUGGINGFACE_API_TOKEN - The API token for HuggingFace
 * 
 * @returns {{ question: string } | errorInterface} - Returns either the generated
 * question or an error object
 */
export function adminQuizQuestionSuggestion(
  quizName: string,
  quizDescription: string,
  HUGGINGFACE_API_TOKEN: string
): { question: string } | errorInterface {
  // Create a prompt for the LLM that includes the quiz context
  const prompt = `You are a helpful assistant that generates quiz questions. 
  Please suggest a single question for a quiz with the following details:
  
  Quiz name: "${quizName}"
  Quiz description: "${quizDescription}"
  
  The question should be relevant to the quiz topic, clear, and concise. 
  The question should be between 5 and 50 characters.
  
  Respond with just the question text, nothing else.`;

  const response = request(
    'POST',
    'https://api-inference.huggingface.co/models/google/gemma-2-2b-it',
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
    return { error: responseBody.error };
  }

  let generatedQuestion = responseBody[0].generated_text;
  const questionMatch = generatedQuestion.match(/^\w.*\?$/m);
  if (!questionMatch) {
    generatedQuestion = `What is ${quizName} about?`;
  } else {
    generatedQuestion = questionMatch[0];
  }

  // Ensure the question meets our requirements
  if (generatedQuestion.length < 5) {
    generatedQuestion = `What is ${quizName} about?`;
  } else if (generatedQuestion.length > 50) {
    generatedQuestion = generatedQuestion.substring(0, 47) + '...';
  }

  return { question: generatedQuestion };
}

/**
 * Updates an existing question in a quiz.
 *
 * @param {number} userId - The ID of the user updating the question
 * @param {number} quizId - The ID of the quiz containing the question
 * @param {number} questionId - The ID of the question to update
 * @param {questionBodyInterface} questionBody - The new question details
 * 
 * @returns {Record<string, never> | errorInterface} - Returns either an empty
 * object on success or an error object
 */
export function adminQuizQuestionUpdate(
  userId: number,
  quizId: number,
  questionId: number,
  questionBody: questionBodyInterface
): Record<string, never> | errorInterface {
  const data = getData();

  const userFound = data.users.some(user => user.userId === userId);
  if (!userFound) {
    return Errors.invalidUser();
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (!quiz) {
    return Errors.invalidQuiz();
  }

  if (quiz.createdBy !== userId) {
    return Errors.noPermission();
  }

  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === -1) {
    return Errors.invalidQuestion();
  }

  const { question, timeLimit, points, answerOptions } = questionBody.questionBody;

  // Validate question string
  const questionValidation = validQuestionString(question);
  if (questionValidation !== true) {
    return questionValidation as errorInterface;
  }

  const answerValid = validateAnswer(answerOptions);
  if (answerValid !== true) {
    return answerValid as errorInterface;
  }

  if (timeLimit <= 0) {
    return Errors.invalidString('Time limit', Errors.Specific.Time.POSITIVE);
  }

  const totalTime = quiz.questions.reduce((sum, q) => sum + q.timeLimit, 0) -
    quiz.questions[questionIndex].timeLimit +
    timeLimit;
  if (totalTime > 180) {
    return Errors.invalidString('Total time limit', Errors.Specific.Time.TOO_LONG);
  }

  const pointsValid = validatePoints(points);
  if (pointsValid !== true) {
    return pointsValid as errorInterface;
  }

  const answerStrings: string[] = [];
  let hasCorrectAnswer = false;

  for (const answer of answerOptions) {
    if (answer.answer.length < 1) {
      return Errors.invalidString('Answer', Errors.Specific.AnswerString.TOO_SHORT);
    }
    if (answer.answer.length > 30) {
      return Errors.invalidString('Answer', Errors.Specific.AnswerString.TOO_LONG);
    }

    // Check for duplicate answers
    if (answerStrings.includes(answer.answer)) {
      return Errors.invalidString('Answer', Errors.Specific.AnswerString.DUPLICATE);
    }
    answerStrings.push(answer.answer);

    if (answer.correct) {
      hasCorrectAnswer = true;
    }
  }

  if (!hasCorrectAnswer) {
    return Errors.noCorrectAnswers();
  }

  let answerId = 0;
  const updatedAnswerOptions = answerOptions.map((option: answersInterface) => {
    answerId++;
    return {
      ...option,
      id: answerId,
      colour: randomColour(),
    };
  });

  // Update the question
  quiz.questions[questionIndex] = {
    questionId,
    question,
    timeLimit,
    points,
    answerOptions: updatedAnswerOptions
  };

  quiz.timeLastEdited = Date.now();
  quiz.timeLimit = totalTime;

  return {};
}
