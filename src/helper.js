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

function validPassword() {
    
}

function valid() {
    
}