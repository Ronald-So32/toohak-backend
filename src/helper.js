import { getData } from "./dataStore.js";

function createUUID() {
  const data = getData();

  data.highestID += 1;

  return data.highestID;
}

export { createUUID };

function validName(name, isFirst) {
  if (name.length < 2) {
    if (isFirst) {
      return { error: 'First name is shorter than 2 characters' };
    } else {
      return { error: 'Last name is shorter than 2 characters' };
    }
  }

  if (name.length > 20) {
    if (isFirst) {
      return { error: 'First name is longer than 20 characters' };
    } else {
      return { error: 'Last name is longer than 20 characters' };
    }
  }

  if (name.search(/[^a-zA-Z\s-']/) !== -1) {
    if (isFirst) {
      return { error: 'First name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
    } else {
      return { error: 'Last name contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
    }
  }

  return true;
}

export { validName };

function validPassword(password) {
  if (password.length < 8) {
    return { error: 'Password is shorter than 8 characters' };
  }

  // check if newPassword contains at least one letter and one number
  const passwordLetter = password.search(/[a-zA-Z]/);
  const passwordNumber = password.search(/\d/);
  if (passwordLetter === -1 || passwordNumber === -1) {
    return { error: 'Password does not contain at least one number and at least one letter' };
  }

  return true;
}

export { validPassword };

function validQuizName(name) {
  if (name.match(/[^a-zA-Z0-9\s]/) !== null) {
    return { error: 'Quiz name contains special characters' };
  }

  if (name.length < 3) {
    return { error: 'Quiz name is lesser than 3' };
  }

  if (name.length > 30) {
    return { error: 'Quiz name is greater than 30' };
  }

  return true;
}

export { validQuizName };