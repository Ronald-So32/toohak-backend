function adminAuthRegister(email, password, nameFirst, nameLast) {
    return {
        userId: 1
    };
}

function adminAuthLogin(email, password) {
    return {
        userId: 1
    };
}

function adminUserDetails(userId) {
    return { user:
        {
          userId: 1,
          name: 'Hayden Smith',
          email: 'hayden.smith@unsw.edu.au',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
        }
    };
}