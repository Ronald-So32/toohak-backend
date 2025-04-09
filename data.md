```javascript
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
    ]
    
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
}
```

# Explanation: 
There are two fields inside the data object, users and quizzes.

Inside the users object, there is the id, name(split into first and last), email, successful logins, failed logins and finally the password.

Inside the quizzes object, there is the id, name, creation date, last edited, description and the id of the user that created the quiz.
