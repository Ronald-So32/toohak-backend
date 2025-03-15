import { v4 as uuidv4 } from 'uuid';
import { parse as uuidParse } from 'uuid';

createUUID();

function createUUID() {
  const ID1 = uuidv4();
  const ID2 = uuidParse(ID1);

  console.log(ID1);
  console.log(ID2);
}

export { createUUID };