function adminQuizList(userId) {
    return { quizzes: [
        {
          quizId: 1,
          name: 'My Quiz',
        }
      ]
    };
}

function adminQuizCreate(userId, name, description) {
    return {
        quizId: 2
    };
}

function adminQuizRemove(userId, quizId) {
    return {};
}

function adminQuizInfo(userId, quizId) {
    return {
        quizId: 1,
        name: 'My Quiz',
        timeCreated: 1683125870,
        timeLastEdited: 1683125871,
        description: 'This is my quiz',
    };
}