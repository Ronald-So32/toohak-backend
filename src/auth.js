import { getData } from './dataStore.js';

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
 * logs in sucessfully
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
  let data = getData();

  for (let user of data.users) {
    if (user.email === email) {	
      return { error: 'Email has already been used by another user' };
    }
  }

  if (!(validator.isEmail(email))) {
    return { error: 'Email is not valid' };
  }

  let firstHasSpecial = nameFirst.search(/[^a-zA-Z _']/);
  if (firstHasSpecial !== -1) {
    return { error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }

  if (nameFirst.length < 2) {
    return { error: 'First name is shorter than 2 characters' };
  }

  if (nameFirst.length > 20) {
    return { error: 'First name is longer than 20 characters' };
  }

  let lastHasSpecial = nameLast.search(/[^a-zA-Z _']/);
  if (lastHasSpecial !== -1) {
    return { error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }

  if (nameLast.length < 2) {
    return { error: 'Last name is shorter than 2 characters' };
  }

  if (nameLast.length > 20) {
    return { error: 'Last name is longer than 20 characters' };
  }

  if (password.length < 8) {
    return { error: 'Password is shorter than 8 characters' };
  }

  let passwordLetter = password.search(/[a-zA-Z]/);
  let passwordNumber = password.search(/\d/);
  if (passwordLetter === -1 || passwordNumber === -1) {
    return { error: 'Password does not contain at least one number and at least one letter' };
  }

  let id;
  let unique = false;

  while (!unique) {
    id = Math.floor(Math.random() * 727727);
    unique = true;

    for (let user of data.users) {
      if (user.userId === id) {
        isUnique = false;
        break;
      }
    }

  }

  data.users.push({
    userId: id,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    password: password,
  });
  
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
  let data = getData();

  let emailFound = false;
  let userData;

  for (let user of data.users) {
    if (user.email === email) {
      emailFound = true;
      userData = user;
    }
  }

  if (!emailFound) {
    return { error: 'Email does not exit' };
  }

  if (userData.password !== password) {
    userData.numFailedPasswordsSinceLastLogin += 1;
    return { error: 'Password is wrong' };
  }

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
  let data = getData();

  let userData;
  let userFound = false;
  
  for (let user of data.users) {
    if (user.userId === userId) {
      userData = user;
      userFound = true;
    }
  }

  if (!userFound) {
    return { error: `User Id of ${userId} is not found` };
  }

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

  let data = getData();

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

  for (const user of data.users) {
    if (user.email === email && user.userId != userId) {	
      return { error: 'Email has already been used by another user' };
    }
  }

  if (!(validator.isEmail(email))) {
    return { error: 'Email is not valid' };
  }
  if (nameFirst.match(/[^a-z\-\s\'\-]/i) !== null) {
    return { error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }

  if (nameFirst.length < 2) {
    return { error: 'First name is shorter than 2 characters' };
  }

  if (nameFirst.length > 20) {
    return { error: 'First name is longer than 20 characters' };
  }

  if (nameLast.match(/[^a-z\-\s\'\-]/i) !== null) {
    return { error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }

  if (nameLast.length < 2) {
    return { error: 'Last name is shorter than 2 characters' };
  }
  
  if (nameLast.length > 20) {
    return { error: 'Last name is longer than 20 characters' };
  }

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

  // invalid user id
  let data = getData();
 
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

  // check password of same userId then see if match oldPassword
  
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

  let target_user;

  for (const user of data.users) {
    if (user.userId === userId) {
      target_user = user; 
    }
  }

  target_user.old_passwords.push(target_user.user.password);

  for (const past_password of target_user.old_passwords) {
    if (past_password === newPassword) {
      return { error: 'New Password has already been used before by this user' };
    }
  }

  if (newPassword.length < 8) {
    return { error: 'New password has less than 8 characters' };
  }

  const number = /\d/.test(newPassword);

  const letter = /[a-zA-Z]/.test(newPassword);

  if (!number || !letter) {
    return { error: 'New Password does not contain at least one number and at least one letter' };
  }    

  target_user.password = newPassword;

  return {};
}

export { adminUserPasswordUpdate };