import { getData } from "./dataStore.js";

function createUUID() {
  const data = getData();

  data.highestID += 1;

  return data.highestID;
}

export { createUUID };