import { getData, sessionInterface, userInterface } from './dataStore';
import {
  createUUID,
  validName,
  validPassword,
  errorInterface,
  userIdInterface,
  userDetailsInterface,
  generateSession,
  Errors,
  BetterError,
  ErrorCodes
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
 * @returns {userIdInterface} - Returns userId and session token
 * if successful
 */
export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): userIdInterface {
  const data = getData();

  // Check if email has already been used
  const emailUsed = data.users.some((user: userInterface) => user.email === email);
  if (emailUsed) {
    throw new BetterError(Errors.invalidEmail().error, ErrorCodes.BADREQUEST);
  }

  // Checks if the email is valid
  if (!(validator.isEmail(email))) {
    throw new BetterError(Errors.invalidEmail().error, ErrorCodes.BADREQUEST);
  }

  validName(nameFirst, true);
  validName(nameLast, false);

  // Checks if the password is valid
  validPassword(password);

  // Creates a UUID for the user
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

  // Generates the current session of user
  const currentSession = generateSession();

  // Pushes the current session to data base of sessions
  data.sessions.push({ userId: id, session: currentSession });

  // New User registered correctly, return id and currentSession
  return {
    userId: id,
    session: currentSession
  };
}

/**
 * Given a registered user's email and password, return their userId value and a new session token.
 *
 * @param {string} email - Email address of the user
 * @param {string} password - Password of the user
 *
 * @returns {userIdInterface} - Returns userId and session token
 * if successful, otherwise returns error
 */
export function adminAuthLogin(
  email: string,
  password: string
): userIdInterface {
  // Fetches the latest data from dataStore
  const data = getData();

  // Checks if the user/email exists or not
  const userData = data.users.find((user: userInterface) => user.email === email);
  if (!userData) {
    throw new BetterError(Errors.invalidEmail().error, ErrorCodes.BADREQUEST);
  }

  // Checks if the password entered is correct
  if (userData.password !== password) {
    userData.numFailedPasswordsSinceLastLogin += 1;
    throw new BetterError(Errors.invalidPassword().error, ErrorCodes.BADREQUEST);
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
 * @returns {{user: userDetailsInterface}} - Returns user details
 * if found, otherwise returns error
 */
export function adminUserDetails(
  userId: number
): { user: userDetailsInterface} {
  const data = getData();

  const userData = data.users.find((user: userInterface) => user.userId === userId);
  if (!userData) {
    throw new BetterError(Errors.invalidUser().error, ErrorCodes.UNAUTHORISED);
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
 * @param {number} userId - Id of the user
 * @param {string} email - Email address of the user
 * @param {string} nameFirst - First name of the user
 * @param {string} nameLast - Last name of the user
 *
 * @returns {Record<string, never> | errorInterface} - Returns empty object if
 * successful, otherwise returns error
 */
export function adminUserDetailsUpdate(
  userId: number,
  email: string,
  nameFirst: string,
  nameLast: string
): Record<string, never> {
  const data = getData();

  const userData = data.users.find((user: userInterface) => user.userId === userId);
  if (!userData) {
    throw new BetterError(Errors.invalidUser().error, ErrorCodes.BADREQUEST);
  }

  // Check if new email has been used by other user
  const isEmailUsedByOtherUser = data.users.some(
    (user: userInterface) => user.email === email && user.userId !== userId
  );
  if (isEmailUsedByOtherUser) {
    throw new BetterError(Errors.invalidEmail().error, ErrorCodes.BADREQUEST);
  }

  if (!(validator.isEmail(email))) {
    throw new BetterError(Errors.invalidEmail().error, ErrorCodes.BADREQUEST);
  }

  validName(nameFirst, true);
  validName(nameLast, false);

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
 * @param {number} userId - Id of the user
 * @param {string} oldPassword - The old password of the user
 * @param {string} newPassword - The new password of the user
 *
 * @returns {Record<string, never> | errorInterface} - Returns empty object if
 * successful, otherwise returns error
 */
export function adminUserPasswordUpdate(
  userId: number,
  oldPassword: string,
  newPassword: string
): Record<string, never> {
  const data = getData();

  const userData = data.users.find((user: userInterface) => user.userId === userId);
  if (!userData) {
    return Errors.invalidUser();
  }

  // Check if password of passed in userId is correct oldPassword
  const user = data.users.find((user: userInterface) => user.userId === userId);
  if (!user || user.password !== oldPassword) {
    return Errors.invalidUser();
  }

  // Check if newPassword has been used before
  if (oldPassword === newPassword) {
    return Errors.invalidString('New password', Errors.Specific.Password.OLD_SAME);
  }

  userData.oldPasswords.push(userData.password);

  const isPasswordReused = userData.oldPasswords.some(
    (pastPassword: string) => pastPassword === newPassword
  );
  if (isPasswordReused) {
    return Errors.invalidString('New password', Errors.Specific.Password.OLD_SAME);
  }

  validPassword(newPassword);

  // The variable newPassword is meets all requirements, so replace password with newPassword
  userData.password = newPassword;

  return {};
}

/**
 * Remove a user's session token (logout).
 *
 * @param {string} session - Session token to remove
 *
 * @returns {Record<string, never> | errorInterface} - Returns empty object if
 * successful, otherwise returns error
 */
export function adminAuthLogout(session: string): Record<string, never> {
  const data = getData();

  // Finds the current session index from all the sessions
  const sessionIndex = data.sessions.findIndex(
    (sessions: sessionInterface) => sessions.session === session
  );

  // Checks the session is valid
  if (sessionIndex === -1) {
    return Errors.invalidSession();
  }

  // Deletes the session from all the sessions
  data.sessions.splice(sessionIndex, 1);

  return {};
}
