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


function adminQuizRemove( userId, quizId ) {
  return {};
}