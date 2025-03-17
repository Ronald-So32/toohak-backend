import { getData } from './dataStore.js';
import { createUUID, validName, validPassword } from './helper.js';

import validator from 'validator';

/**
 * A instance of this object:
 * {
 *    error: error message,
 * }
 *
 * @typedef {object} error - Object containing just the error message
 *
 * @property {string} error - Error message relevant to the problem
 */

/**
 * A instance of this object:
 * {
 *    userId: 1,
 * }
 *
 * @typedef {object} userId - Object containing just the user Id
 *
 * @property {number} userId - Id of user
 */

/**
 * A instance of this object:
 * {
 *    userId: 1,
 *    name: 'Hayden Smith',
 *    email: 'hayden.smith@unsw.edu.au',
 *    numSuccessfulLogins: 3,
 *    numFailedPasswordsSinceLastLogin: 1,
 * }
 *
 * @typedef {object} user - Data structure containing the details of the user
 *
 * @property {number} userId - Id of the user
 * @property {string} name - Full name of the user
 * @property {string} email - Email address of the user
 * @property {number} numSuccessfulLogins - The number of times that the user
 * logs in successfully
 * @property {number} numFailedPasswordsSinceLastLogin - The number of failed
 * login attempts by the user since the last login
 */

/**
 * Register a user with an email, password, and names, then return their
 * userId value.
 *
 * @param {string} email - Email address of the user
 * @param {string} password - Password of the user
 * @param {string} nameFirst - First name of the user
 * @param {string} nameLast - Last name of the user
 *
 * @returns {userId | error} - Always return userId object otherwise an error object with relevant message
*/
function adminAuthRegister(email, password, nameFirst, nameLast) {
  const data = getData();

  // Check if email has already been used
  const emailUsed = data.users.some(user => user.email === email);
  if (emailUsed) {
    return { error: 'Email has already been used by another user' };
  }

  if (!(validator.isEmail(email))) {
    return { error: 'Email is not valid' };
  }

  const validFirst = validName(nameFirst, true);
  if (validFirst !== true) {
    return validFirst;
  }

  const validLast = validName(nameLast, false);
  if (validLast !== true) {
    return validLast;
  }

  const validPass = validPassword(password);
  if (validPass !== true) {
    return validPass;
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

  // New User registered correctly, return id
  return {
    userId: id
  };
}

export { adminAuthRegister };

/**
 * Given a registered user's email and password, return their userId value.
 *
 * @param {string} email - Email address of the user
 * @param {string} password - Password of the user
 *
 * @returns {userId | error} - Always return userId object otherwise an error object with relevant message
*/
function adminAuthLogin(email, password) {
  const data = getData();

  const userData = data.users.find(user => user.email === email);
  if (!userData) {
    return { error: 'Email does not exist' };
  }

  // User password is not correct
  if (userData.password !== password) {
    userData.numFailedPasswordsSinceLastLogin += 1;
    return { error: `Password is wrong stored:${userData.password}, asked:${password}` };
  }

  // Update number of successful logins
  userData.numSuccessfulLogins += 1;
  userData.numFailedPasswordsSinceLastLogin = 0;

  return {
    userId: userData.userId,
  };
}

export { adminAuthLogin };

/**
 * Given an admin user's userId, return details about the user."name" is the
 * first and last name concatenated with a single space between them.
 *
 * @param {number} userId - Id of the user
 *
 * @returns {user | error} - Always return userDetails object otherwise an error object with relevant error message
*/
function adminUserDetails(userId) {
  const data = getData();

  const userData = data.users.find(user => user.userId === userId);
  if (!userData) {
    return { error: `User Id of ${userId} is not found` };
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

export { adminUserDetails };

/**
  * Given an admin user's userId and a set of properties, update the properties
  * of this logged in admin user.
  *
  * @param {number} - Id of the user
  * @param {string} - Email address of the user
  * @param {string} - First name of the user
  * @param {string} - Last name of the user
  *
  * @returns {object | error} - Always return an empty object otherwise an error object with relevant error message
*/
function adminUserDetailsUpdate(userId, email, nameFirst, nameLast) {
  const data = getData();

  const userData = data.users.find(user => user.userId === userId);
  if (!userData) {
    return { error: `User Id of ${userId} is not found` };
  }

  // Check if new email has been used by other user
  const isEmailUsedByOtherUser = data.users.some(user => user.email === email && user.userId !== userId);
  if (isEmailUsedByOtherUser) {
    return { error: 'Email has already been used by another user' };
  }

  if (!(validator.isEmail(email))) {
    return { error: 'Email is not valid' };
  }

  const validFirst = validName(nameFirst, true);
  if (validFirst !== true) {
    return validFirst;
  }

  const validLast = validName(nameLast, false);
  if (validLast !== true) {
    return validLast;
  }

  // All new user details have been verified, user details are updated
  userData.email = email;
  userData.nameFirst = nameFirst;
  userData.nameLast = nameLast;

  return {};
}

export { adminUserDetailsUpdate };

/**
  * Given details relating to a password change, update the password of a
  * logged in user.
  *
  * @param {number} - Id of the user
  * @param {string} - The old password of the user
  * @param {string} - The new password of the user
  *
  * @returns {object} - Always return an empty object otherwise an error object with relevant error message
*/
function adminUserPasswordUpdate(userId, oldPassword, newPassword) {
  const data = getData();

  const userData = data.users.find(user => user.userId === userId);
  if (!userData) {
    return { error: `User Id of ${userId} is not found` };
  }

  // Check if password of passed in userId is correct oldPassword
  const user = data.users.find(user => user.userId === userId);
  if (!user || user.password !== oldPassword) {
    return { error: 'Old Password is not the correct old password' };
  }

  if (oldPassword === newPassword) {
    return { error: 'oldPassword is the same as new one' };
  }

  // Check if newPassword has been used before
  userData.oldPasswords.push(userData.password);

  const isPasswordReused = userData.oldPasswords.some(pastPassword => pastPassword === newPassword);
  if (isPasswordReused) {
    return { error: 'New Password has already been used before by this user' };
  }

  const validPass = validPassword(newPassword);
  if (validPass !== true) {
    return validPass;
  }

  // The variable newPassword is meets all requirements, so replace password with newPassword
  userData.password = newPassword;

  return {};
}

export { adminUserPasswordUpdate };
