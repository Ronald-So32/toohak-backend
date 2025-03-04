import { getData } from './dataStore.js';

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

  let id;
  let unique = false;

  while (!unique) {
    let id = Math.floor(Math.random() * 727727);

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
  return {
    userId: 1
  };
}

/**
 * Given an admin user's userId, return details about the user."name" is the
 * first and last name concatenated with a single space between them.
 * 
 * @param {number} userId - Id of the user
 * 
 * @returns {user} - Always return userDetails object
*/
function adminUserDetails(userId) {
  return { user:
    {
      userId: 1,
      name: 'Hayden Smith',
      email: 'hayden.smith@unsw.edu.au',
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
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
  * @returns {Object} - Always return an empty object
*/
function adminUserDetailsUpdate(userId, email, nameFirst, nameLast) {
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
  * @returns {Object} - Always return an empty object
*/
function adminUserPasswordUpdate(userId, oldPassword, newPassword) {
  return {};
}
