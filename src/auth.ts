import { error } from 'console';
import { getData } from './dataStore';
import {
  createUUID,
  validName,
  validPassword,
  errorInterface,
  userIdInterface,
  userDetailsInterface,
  generateSession,
  findSessionFromUserId,
  Errors
} from './functionsHelper';

import validator from 'validator';

/**
 * Register a user with an email, password, and names, then return their
 * userId value.
 *
 * @param {string} email - Email address of the user
 * @param {string} password - Password of the user
 * @param {string} nameFirst - First name of the user
 * @param {string} nameLast - Last name of the user
 *
 * @returns {userId | error} - Always return userId object otherwise
 * an error object with relevant message
*/
export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): userIdInterface | errorInterface {
  const data = getData();

  // Check if email has already been used
  const emailUsed = data.users.some(user => user.email === email);
  if (emailUsed) {
    return Errors.invalidEmail();
  }

  if (!(validator.isEmail(email))) {
    return Errors.invalidEmail();
  }

  const validFirst = validName(nameFirst, true);
  if (validFirst !== true) {
    return validFirst as errorInterface;
  }

  const validLast = validName(nameLast, false);
  if (validLast !== true) {
    return validLast as errorInterface;
  }

  const validPass = validPassword(password);
  if (validPass !== true) {
    return validPass as errorInterface;
  }

  const id = createUUID();

  // All user details are correct so push append them to the users array
  data.users.push({
    userId: id,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    password: password,
    oldPasswords: [],
  });

  const currentSession = generateSession();

  data.sessions.push({ userId: id, session: currentSession });

  // New User registered correctly, return id and currentSession
  return {
    userId: id,
    session: currentSession
  };
}

/**
 * Given a registered user's email and password, return their userId value.
 *
 * @param {string} email - Email address of the user
 * @param {string} password - Password of the user
 *
 * @returns {userId | error} - Always return userId object otherwise
 * an error object with relevant message
*/
export function adminAuthLogin(
  email: string,
  password: string
): userIdInterface | errorInterface {
  const data = getData();

  const userData = data.users.find(user => user.email === email);
  if (!userData) {
    return Errors.invalidEmail();
  }

  // User password is not correct
  if (userData.password !== password) {
    userData.numFailedPasswordsSinceLastLogin += 1;
    return Errors.invalidPassword();
  }

  const currentSession = generateSession();

  data.sessions.push({ userId: userData.userId, session: currentSession });

  // Update number of successful logins
  userData.numSuccessfulLogins += 1;
  userData.numFailedPasswordsSinceLastLogin = 0;

  return {
    userId: userData.userId,
    session: currentSession
  };
}

/**
 * Given an admin user's userId, return details about the user."name" is the
 * first and last name concatenated with a single space between them.
 *
 * @param {number} userId - Id of the user
 *
 * @returns {user | error} - Always return userDetails object otherwise
 * an error object with relevant error message
*/
export function adminUserDetails(
  userId: number
): { user: userDetailsInterface} | errorInterface {
  const data = getData();

  const userData = data.users.find(user => user.userId === userId);
  if (!userData) {
    return Errors.invalidUser();
  }

  // If the variable userId exists, return user details
  return {
    user: {
      userId: userData.userId,
      name: `${userData.nameFirst} ${userData.nameLast}`,
      email: userData.email,
      numSuccessfulLogins: userData.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: userData.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
  * Given an admin user's userId and a set of properties, update the properties
  * of this logged in admin user.
  *
  * @param {number} - Id of the user
  * @param {string} - Email address of the user
  * @param {string} - First name of the user
  * @param {string} - Last name of the user
  *
  * @returns {object | error} - Always return an empty object otherwise
  * an error object with relevant error message
*/
export function adminUserDetailsUpdate(
  userId: number,
  email: string,
  nameFirst: string,
  nameLast: string
): Record<string, never> | errorInterface {
  const data = getData();

  const userData = data.users.find(user => user.userId === userId);
  if (!userData) {
    return Errors.invalidUser();
  }

  // Check if new email has been used by other user
  const isEmailUsedByOtherUser = data.users.some(
    user => user.email === email && user.userId !== userId
  );
  if (isEmailUsedByOtherUser) {
    return Errors.invalidEmail();
  }

  if (!(validator.isEmail(email))) {
    return Errors.invalidEmail();
  }

  const validFirst = validName(nameFirst, true);
  if (validFirst !== true) {
    return validFirst as errorInterface;
  }

  const validLast = validName(nameLast, false);
  if (validLast !== true) {
    return validLast as errorInterface;
  }

  // All new user details have been verified, user details are updated
  userData.email = email;
  userData.nameFirst = nameFirst;
  userData.nameLast = nameLast;

  return {};
}

/**
  * Given details relating to a password change, update the password of a
  * logged in user.
  *
  * @param {number} - Id of the user
  * @param {string} - The old password of the user
  * @param {string} - The new password of the user
  *
  * @returns {object} - Always return an empty object otherwise an
  * error object with relevant error message
*/
export function adminUserPasswordUpdate(
  userId: number,
  oldPassword: string,
  newPassword: string
): Record<string, never> | errorInterface {
  const data = getData();

  const userData = data.users.find(user => user.userId === userId);
  if (!userData) {
    return Errors.invalidUser();
  }

  // Check if password of passed in userId is correct oldPassword
  const user = data.users.find(user => user.userId === userId);
  if (!user || user.password !== oldPassword) {
    return Errors.invalidUser();
  }

  if (oldPassword === newPassword) {
    return Errors.invalidString('New password', Errors.Specific.Password.OLD_SAME);
  }

  // Check if newPassword has been used before
  userData.oldPasswords.push(userData.password);

  const isPasswordReused = userData.oldPasswords.some(pastPassword => pastPassword === newPassword);
  if (isPasswordReused) {
    return Errors.invalidString('New password', Errors.Specific.Password.OLD_SAME);
  }

  const validPass = validPassword(newPassword);
  if (validPass !== true) {
    return validPass as errorInterface;
  }

  // The variable newPassword is meets all requirements, so replace password with newPassword
  userData.password = newPassword;

  return {};
}

export function adminAuthLogout(session: string): Record<string, never> | errorInterface {
  const data = getData();

  const sessionIndex = data.sessions.findIndex(s => s.session === session);
  
  if (sessionIndex === -1) {
    return Errors.invalidSession();
  }
  
  data.sessions.splice(sessionIndex, 1);

  return {};
}