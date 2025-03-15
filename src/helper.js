import { getData } from "./dataStore.js";

function createUUID(type) {
  const data = getData();

  data.highestID += 1;

  return data.highestID;
}

export { createUUID };