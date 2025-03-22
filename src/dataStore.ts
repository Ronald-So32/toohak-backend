// YOU MAY MODIFY THIS OBJECT BELOW
interface userInterface {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  password: string;
  oldPasswords: string[];
}

interface quizInterface {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  createdBy: number;
}

interface Data {
  users: userInterface[];
  quizzes: quizInterface[];

  highestID: number;
}

const data: Data = {
  users: [],
  quizzes: [],

  highestID: 0
};

// YOU MAY MODIFY THIS OBJECT ABOVE

// YOU SHOULDN'T NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
  let store = getData()
  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

  store.names.pop() // Removes the last name from the names array
  store.names.push('Jake') // Adds 'Jake' to the end of the names array

  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
*/

// Use getData() to access the data
export function getData(): data {
  return data;
}