import { getData } from './dataStore.js';
import { createUUID, validName, validPassword } from './helper.js';

import validator from 'validator';

/**
 * A instance of this object:
 * {
 *    userId: 1,
 * }
 *
 * @typedef {Object} userId - Object containing just the user Id
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
 * @typedef {Object} user - Data structure containing the details of the user
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
 * @returns {userId} - Always return UserId object
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

  // New User registered correclty, return id
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
 * @returns {userId} - Always return userId object
*/
function adminAuthLogin(email, password) {
  const data = getData();

  let emailFound = false;
  let userData;

  // check if userId is valid
  for (const user of data.users) {
    if (user.email === email) {
      emailFound = true;
      userData = user;
    }
  }

  if (!emailFound) {
    return { error: 'Email does not exit' };
  }

  // user password is not correct
  if (userData.password !== password) {
    userData.numFailedPasswordsSinceLastLogin += 1;
    return { error: `Password is wrong stored:${userData.password}, asked:${password}` };
  }

  // update number of successful logins
  userData.numSuccessfulLogins += 1;

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
 * @returns {user} - Always return userDetails object
*/
function adminUserDetails(userId) {
  const data = getData();

  let userData;
  let userFound = false;

  // Check if userId is valid
  for (const user of data.users) {
    if (user.userId === userId) {
      userData = user;
      userFound = true;
    }
  }

  if (!userFound) {
    return { error: `User Id of ${userId} is not found` };
  }

  // userId exists, return user details
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
  * @returns {Object} - Always return an empty object
*/
function adminUserDetailsUpdate(userId, email, nameFirst, nameLast) {
  const data = getData();

  let userData;
  let userFound = false;

  for (const user of data.users) {
    if (user.userId === userId) {
      userData = user;
      userFound = true;
    }
  }

  if (!userFound) {
    return { error: `User Id of ${userId} is not found` };
  }

  // check if new email has been used by other user
  for (const user of data.users) {
    if (user.email === email && user.userId !== userId) {
      return { error: 'Email has already been used by another user' };
    }
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

  // all new user details have been verified, user details are updated
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
  * @returns {Object} - Always return an empty object
*/
function adminUserPasswordUpdate(userId, oldPassword, newPassword) {
  const data = getData();

  let userData;
  let userFound = false;
  
  for (const user of data.users) {
    if (user.userId === userId) {
      userData = user;
      userFound = true;
    }
  }

  if (!userFound) {
    return { error: `User Id of ${userId} is invalid` };
  }

  // Check if password of passed in userId is correct oldPassword
  for (const user of data.users) {
    if (user.userId === userId) {
      if (user.password !== oldPassword) {
        return { error: 'Old Password is not the correct old password' };
      }
    }
  }

  if (oldPassword === newPassword) {
    return { error: 'oldPassword is the same as new one' };
  }

  // check if neewPassword has been used before
  userData.oldPasswords.push(userData.password);

  for (const pastPassword of userData.oldPasswords) {
    if (pastPassword === newPassword) {
      return { error: 'New Password has already been used before by this user' };
    }
  }

  const validPass = validPassword(newPassword);
  if (validPass !== true) {
    return validPass;
  }

  // newPassword is meets all requirements,
  // so make userId's password the newPassword
  userData.password = newPassword;

  return {};
}

export { adminUserPasswordUpdate };
