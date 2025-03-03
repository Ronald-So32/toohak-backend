// YOU MAY MODIFY THIS OBJECT BELOW
let data = {
  users: [
    {
        userId: 1,
        nameFirst: 'Hayden',
        nameLast: 'Smith',
        email: 'hayden.smith@unsw.edu.au',
        numSuccessfulLogins: 3,
        numFailedPasswordsSinceLastLogin: 1,
        password: '123456',
    },
    {
        userId: 2,
        nameFirst: 'Some',
        nameLast: 'One',
        email: 'someone@unsw.edu.au',
        numSuccessfulLogins: 7,
        numFailedPasswordsSinceLastLogin: 0,
        password: 'qwerty',
    },
  ],

  quizzes: [
      {
          quizId: 1,
          name: 'My Quiz',
          timeCreated: 1683125870,
          timeLastEdited: 1683125871,
          description: 'This is my quiz',
          createdBy: 1,
          
      },
      {
          quizId: 2,
          name: 'My Quiz2',
          timeCreated: 1123145270,
          timeLastEdited: 1783128871,
          description: 'This is my quiz 2',
          createdBy: 2,
      },
  ]

};

// YOU MAY MODIFY THIS OBJECT ABOVE

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
  let store = getData()
  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

  store.names.pop() // Removes the last name from the names array
  store.names.push('Jake') // Adds 'Jake' to the end of the names array

  console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
*/

// Use getData() to access the data
function getData() {
  return data;
}

export { getData };
