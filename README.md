# COMP1531 Major Project

**✨ 🥜 Toohak 🥜 ✨**

## Contents

[[_TOC_]]

## Change Log

## 🫡 0. Aims:

1. Demonstrate effective use of software development tools to build full-stack end-user applications.
2. Demonstrate effective use of static testing, dynamic testing, and user testing to validate and verify software systems.
3. Understand key characteristics of a functioning team in terms of understanding professional expectations, maintaining healthy relationships, and managing conflict.
4. Demonstrate an ability to analyse complex software systems in terms of their data model, state model, and more.
5. Understand the software engineering life cycle in the context of modern and iterative software development practices in order to elicit requirements, design systems thoughtfully, and implement software correctly.
6. Demonstrate an understanding of how to use version control and continuous integration to sustainably integrate code from multiple parties.

## 🌈 1. Overview

UNSW has been having severe issues with lecture attendance - students just aren't coming to class, and they're citing that class isn't interesting enough for them.

UNSW must resort to giving into the limited attention span of students and gamify lecture and tutorial time as much as possible - by doing interactive and colourful quizzes.

However, instead of licensing well-built and tested software, UNSW is hoping to use the pool of extremely talented and interesting COMP1531 students to create their own version to distribute around campus for free. The chosen game to "take inspiration from" is **<a href="https://kahoot.com/">Kahoot</a>**.

(For legal reasons, this is a joke).

The 25T1 cohort of COMP1531 students will build the **backend Javascript server** for a new quiz game platform, **Toohak**. We plan to task future students to build the frontend for Toohak, something you won't have to worry about.

**Toohak** is the questionably-named quiz tool that allows admins to create quiz games, and players to join (without signing up) to participate and compete.

We have already specified a **common interface** for the frontend and backend to operate on. This allows both courses to go off and do their own development and testing under the assumption that both parties will comply with the common interface. This is the interface **you are required to use**.

The specific capabilities that need to be built for this project are described in the interface at the bottom. This is clearly a lot of features, but not all of them are to be implemented at once.

We highly recommend **creating and playing** a Kahoot game to better understand your task:
- To sign up and log in as an admin, go to [kahoot.com](https://kahoot.com/).
- To join a game created by an admin, go to [kahoot.it](https://kahoot.it/).

## 🐭 2. Iteration 0: Getting Started

[You can watch the iteration 0 introductory video here.](https://youtu.be/YhBwRQN--gs) This video is not required watching (the specification is clear by itself) though many students find it useful as a starting point.

### 🐭 2.1. Task

This iteration is designed as a warm-up to help you setup your project, learn Git and project management practices (see Marking Criteria), and understand how your team works together.

In this iteration, you are expected to:
1. Write stub code for the basic functionality of Toohak. The basic functionality is defined in the interface section below.
    * A stub is a function declaration and sample return value (see example below). **Do NOT write the implementation** for the stubbed functions. That is for the next iteration. In this iteration you are just focusing on setting up your function declarations and getting familiar with Git.
    * Each team member must stub **AT LEAST 1** function each.
    * Function stub locations should be inside files specified in the interface section below.
    * Return values should exactly match the interface table below (see example below).
```javascript
// Sample stub for the authLoginV1 function
// Return stub value matches table below
function adminAuthLogin(email, password) {
  return {
    userId: 1,
  }
}
```
2. Design a structure to store all the data needed for Toohak, and place this in the [code block](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks) inside the `data.md` file. Specifically, you must consider how to store information about **users** and **quizzes** and populate ONE example `user` and `quiz` in your data structure (any values are fine - see example below).
    * Use the interface table (2.2) to help you decide what data might need to be stored. This will require making some educated guesses about what would be required to be stored in order to return the types of data you see. **Whilst the data structure you describe in data.md might be similar to the interface, it is a different thing to the interface.** If you're still confused, think of the interface like a restaurant menu, and `data.md` like where the food is stored in the back. It's all the same food, but the menu is about how it's packaged up and received from the kitchen, and `data.md` is describing the structure of how it's all stored behind the scenes. 
    * As functions are called, this structure would be populated with more users and quizzes, so consider this in your solution.
    * Focus on the structure itself (object/list composition), rather than the example contents.
```javascript
// Example values inside of a 'user' object might look like this
// NOTE: this object's data is not exhaustive, you may need more/fewer fields stored as you complete this project. 
{
  uId: 1,
  nameFirst: 'Rani',
  nameLast: 'Jiang',
  email: 'ranivorous@gmail.com',
}
```

3. Follow best practices for git and teamwork as discussed in lectures.
    * Create a group contract by completing `contract.md` - you may add/edit this template as you see fit.
    * You are expected to have **at least 1 meeting** with your group, and document the meeting(s) in meeting minutes which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting). We have provided you with a `minutes-template.md` which you may use if you choose.
    * For this iteration each team member will need to make a minimum of **1 merge request (MR) per person** in your group into the `master` branch.
    * **1 merge request per function** must be made (12 in total). Each merge request needs to be approved by a team member that did not create the MR. 
    * Check out the lab on Git from week 1 to get familiar with using Git.

### 🐭 2.2. Functions to stub

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`, `oldPassword`, `newPassword`.

The following are integers: `userId`, `quizId`.

In terms of file structure:
 * All functions starting with `adminAuth` or `adminUser` go in `auth.js`.
 * All functions starting with `adminQuiz` go in `quiz.js`.
 * `clear` goes in `other.js`.

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a user with an email, password, and names, then return their <code>userId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  userId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered user's email and password, return their <code>userId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  userId: 1
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetails</code>
      <br /><br />
      Given an admin user's userId, return details about the user.
      <li>"<code>name</code>" is the first and last name concatenated with a single space between them.</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ user:
  {
    userId: 1,
    name: 'Hayden Smith',
    email: 'hayden.smith@unsw.edu.au',
    numSuccessfulLogins: 3,
    numFailedPasswordsSinceLastLogin: 1,
  }
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetailsUpdate</code>
      <br /><br />
      Given an admin user's userId and a set of properties, update the properties of this logged in admin user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, email, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizList</code>
      <br /><br />
      Provide a list of all quizzes that are owned by the currently logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ quizzes: [
    {
      quizId: 1,
      name: 'My Quiz',
    }
  ]
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizCreate</code>
      <br /><br />
      Given basic details about a new quiz, create one for the logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, name, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  quizId: 2
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizRemove</code>
      <br /><br />
      Given a particular quiz, permanently remove the quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizInfo</code>
      <br /><br />
      Get all of the relevant information about the current quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{
  quizId: 1,
  name: 'My Quiz',
  timeCreated: 1683125870,
  timeLastEdited: 1683125871,
  description: 'This is my quiz',
}</code>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizNameUpdate</code>
      <br /><br />
      Update the name of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId, name )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId, description )</code>
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>()</code> no parameters
      <br /><br />
      <b>Return object:</b><br />
      <code>{ }</code> empty object
    </td>
  </tr>
</table>

### 🐭 2.3 Marking Criteria
<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Implementation)</td>
    <td>40%</td>
    <td><ul>
      <li>Correct implementation of specified stubs.</li>
    </ul></td>
  </tr>
  <tr>
  <tr>
    <td>Documentation</td>
    <td>20%</td>
    <td><ul>
      <li>Clear and obvious effort and time gone into thinking about possible representation of data structure for the project containing users and quizzes, inside of <code>data.md</code>.</li>
    </ul></td>
  </tr>
  <tr>
    <td>Git Practices</td>
    <td>30%</td>
    <td><ul>
      <li>Meaningful, informative and consistent git commit messages and branch names being used (see <a href="https://initialcommit.com/blog/git-commit-messages-best-practices#:~:text=commit%20message%20style.-,General%20Commit%20Message%20Guidelines,-As%20a%20general">examples</a>).</li>
      <li>Effective use of merge requests (from branches being made) across the team (as covered in lectures). Repeated commit names are avoided.</li>
      <li>At least 1 merge request per person and 1 merge request per function (12 in total) made into the <code>master</code> branch. Each merge request is approved by a team member that did not create the MR. </li>
    </ul></td>
  </tr>
  <tr>
    <td>Project Management & Teamwork</td>
    <td>10%</td>
    <td><ul>
      <li>Completed group contract.</li>
      <li>A generally equal contribution between team members.</li>
      <li>Effective and regular use of course-provided MS Teams for communication (or another app approved by your tutor with evidence added to Teams), demonstrating an ability to competently manage teamwork online.</li>
      <li>Had a meeting together that involves planning and managing tasks, and taken notes from said meeting (and stored in a logical place in the repo e.g. Wiki section).</li>
    </ul></td>
  </tr>
</table>

### 🐭 2.4. Dryrun

We have provided a dryrun for iteration 0 consisting of one test for each function. Passing these tests means you have a correct implementation for your stubs, and have earned the marks for the automarking component iteration 0.

To run the dryrun, you should on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) and in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 0
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~cs1531/bin/iter0.test.js
```

### 🐭 2.4. FAQs

Please see the <a href="https://edstem.org/au/courses/21170/discussion/2425606">this EdStem megapost</a> for iteration 0 FAQs.

### 🐭 2.5. Submission

Please see section 6 for information on **due date**.

## 🐶 3. Iteration 1: Requirements, Basic Functionality and Tests

[You can watch the iteration 1 introductory video here.](https://youtu.be/hEmdnk39qLg) This video is not required watching (the specification is clear by itself) though many students find it useful as a starting point.

### 🐶 3.1. Task

In this iteration, you are expected to:

1. Produce a short report, `planning.pdf` containing a simplified approach to understanding user problems, and developing requirements for Toohak.
    * You will interview users of existing quiz platforms like Toohak to identify their requirements. You will create user stories, a use case, and validate these requirements with the users you interviewed.

    * Note that at this stage, the user stories and use cases you generate may or may not be implemented in this project assignment. The goal is to practice identifying and documenting requirements, even if not all of them are built immediately. Later, in Project Iteration 3, you will have the opportunity to extend your project with open-ended features, where you can implement additional functionality based on the requirements you have defined. This structured approach will help you gain confidence in each step of the SDLC before applying it to more complex development tasks.

    * The course has set up some basic features for you to implement - as described in Tasks 2.


2. Write tests for and implement the basic functionality of Toohak. The basic functionality is defined as per the interface section below.
    * Test files you add should all be in the form `*.test.js`.
    * Do NOT attempt to try and write or start a web server. Don't overthink how these functions are meant to connect to a frontend yet. That is for the next iteration. In this iteration you are just focusing on the basic backend functionality.

3. Follow best practices for git, project management, and effective teamwork, as discussed in lectures.
    * The marking will be heavily biased toward how well you follow good practices and work together as a team. Just having a "working" solution at the end is not, on its own, sufficient to even get a passing mark.

    * You need to use the [**GitLab Issue Boards**](https://docs.gitlab.com/ee/user/project/issue_board.html) (or similar) for your task tracking and allocation. Spend some time getting to know how to use the taskboard. If you would like to use another collaborative task tracker e.g. Jira, Trello, Airtable, etc. you must first get approval from your tutor and grant them administrator access to your team board.

    * You are expected to meet regularly with your group and document the meetings via meeting minutes, which should be stored at a timestamped location in your repo (e.g. uploading a word doc/pdf or writing in the GitLab repo Wiki after each meeting).

    * You should have regular standups and be able to demonstrate evidence of this to your tutor.

    * For this iteration, you will need to collectively make a minimum of **12 merge requests** into `master`.

### 🐶 3.2. Planning for the problems to solve

Before we start implementing any features for our software systems, we need first to understand the requirements for the system, so make sure that we are building the right systems. This is an essential step in the Software Development Life Cycle (SDLC) and will help you build a strong foundation for future development.

For iteration 1 you are going to produce a short report in `planning.pdf` and place it in the repository. The contents of this report will be a simplified approach to understanding user problems, and developing requirements.

N.B. If you don't know how to produce a PDF, you can easily make one in Google docs and then export to PDF.

We have opted not to provide you with a sample structure - because we're not interested in any rigid structure. Structure it however you best see fit, as we will be looking at content only.

#### [Requirements] Elicitation

Find 2-3 people to interview as target users. Target users are people who currently use a tool like Kahoot, or intend to and are not current or former 1531 students. Record their name and email address. You must not interview members of your project group.

Develop a series of questions (at least 4) to ask these target users to understand what *problems* (not solutions) they might have with quiz tools like Kahoot. Give these questions to your target users and record their answers.


#### [Requirements] Analysis & Specification - User stories and use cases

Once you've elicited this information, it's time to consolidate it.

Take the responses from the elicitation step and express these requirements as **user stories** (at least 3). Document these user stories. For each user story, add user acceptance criteria as notes so that you have a clear definition of when a story has been completed.

Once the user stories have been documented, generate at least ONE use case that attempts to describe how the system works that satifies some of or all the elicited requirements. You can generate a visual diagram or a more written-recipe style, as per lectures.

#### [Requirements] Validation

With your completed use case work, reach out to the 2-3 people you interviewed originally and inquire as to the extent to which these use cases would adequately describe the problem they're trying to solve. Ask them for a comment on this, and record their comments in the PDF.


### 🐶 3.3. Storing data

Nearly all of the functions will likely have to reference some "data source" to store information. E.g. If you register two users, create two quizzes, all of that information needs to be "stored" somewhere. The most important thing for iteration 1 is not to overthink this problem.

Firstly, you should **not** use an SQL database, or something like firebase.

Secondly, you don't need to make anything persist. What that means is that if you run all your tests, and then run them again later, it's OK for the data to be "fresh" each time you run the tests. We will cover persistence in another iteration.

Inside `src/dataStore.js` we have provided you with an object called `data` which will contain the information that you will need to access across multiple functions. An explanation of how to `get` the data is in `dataStore.js`. You will need to determine the internal structure of the object. You are allowed to modify this data structure.

For example, you could define a structure in a file that is empty, and as functions are called, the structure populates and fills up like the one below:

```javascript
let data = {
    users: [
        {
            id: 1,
            nameFirst: 'user1',
        },
        {
            id: 2,
            nameFirst: 'user2',
        },
    ],
    quizzes: [
        {
            id: 1,
            name: 'quiz1',
        },
        {
            id: 2,
            name: 'quiz2',
        },
    ],
}
```
### 🐶 3.4. Implementing and testing features

You should first approach this project by considering its distinct "features". Each feature should add some meaningful functionality to the project, but still be as small as possible. You should aim to size features as the smallest amount of functionality that adds value without making the project more unstable. For each feature you should:

1. Create a new branch.
1. Write function stub/s for your feature. This may have been completed in iteration 0 for some functions.
1. Write tests for that feature and commit them to the branch. These will fail as you have not yet implemented the feature.
1. Implement that feature.
1. Make any changes to the tests such that they pass with the given implementation. You should not have to do a lot here. If you find that you are, you're not spending enough time on your tests.
1. Create a merge request for the branch.
1. Get someone in your team who **did not** work on the feature to review the merge request.
1. Fix any issues identified in the review.
1. After merge request is **approved** by a different team member, merge the merge request into `master`.

For this project, a feature is typically sized somewhere between a single function, and a whole file of functions (e.g. `auth.js`). It is up to you and your team to decide what each feature is.

There is no requirement that each feature is implemented by only one person. In fact, we encourage you to work together closely on features, especially to help those who may still be coming to grips with Javascript.

Please pay careful attention to the following:

* We want to see **evidence that you wrote your tests before writing your implementation**. As noted above, the commits containing your initial tests should appear *before* your implementation for every feature branch. If we don't see this evidence, we will assume you did not write your tests first and your mark will be reduced.
* Merging in merge requests with failing tests is **very bad practice**. Not only does this interfere with your team's ability to work on different features at the same time, and thus slow down development, it is something you will be **penalised** for in marking.
* Similarly, merging in branches with untested features is also **bad practice**. We will assume, and you should too, that any code without tests does not work.
* Pushing directly to `master` is not possible for this repo. The only way to get code into `master` is via a merge request. If you discover you have a bug in `master` that got through testing, create a bugfix branch and merge that in via a merge request.
* As is the case with any system or functionality, there will be some things that you can test extensively, some things that you can test sparsely/fleetingly, and some things that you can't meaningfully test at all. You should aim to test as extensively as you can, and make judgements as to what things fall into what categories.

### 🐶 3.5. Testing guidelines & advice

#### 🐶 3.5.1. Test Structure
The tests you write should be as small and independent as possible. This makes it easier to identify why a particular test may be failing. Similarly, try to make it clear what each test is testing for. Meaningful test names and documentation help with this. An example of how to structure tests has been done in:

* `src/echo.js`
* `src/echo.test.js`

_The echo functionality is tested, both for correct behaviour and for failing behaviour. As echo is relatively simple functionality, only 2 tests are required. For the larger features, you will need many tests to account for many different behaviours._

#### 🐶 3.5.2. Black Box Testing

Your tests should be *black box* unit tests:
  * Black box means they should not depend your specific implementation, but rather work with *any* faithful implementation of the project interface specification. I.e. you should design your tests such that if they were run against another group's backend they would still pass.
  * For iteration 1, you should *not* be importing the `data` object itself or directly accessing it via the `get` functions from `src/dataStore.js` inside your tests.
  * Unit tests mean the tests focus on testing particular functions, rather than the system as a whole. Certain unit tests will depend on other tests succeeding. It's OK to write tests that are only a valid test if other functions are correct (e.g. to test `quiz` functions you can assume that `auth` is implemented correctly).

This will mean you will use code like this to test login, for instance:

```javascript
let result = adminAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella')
adminAuthLogin('validemail@gmail.com', '123abc!@#') // Expect to work since we registered
```

#### 🐶 3.5.3. Resetting state

You should reset the state of the application (e.g. deleting all users, quizzes, etc.) at the start of every test. That way you know none of them are accidentally dependent on an earlier test. You can use a function for this that is run at the beginning of each test (hint: `clear`).

#### 🐶 3.5.4. Other help

* If you find yourself needing similar code at the start of a series of tests, consider using Jest's [**beforeEach**](https://jestjs.io/docs/api#beforeeachfn-timeout) to avoid repetition.

Sometimes you may ask "What happens if X?". In cases where we don't specify behaviour, we call this **undefined behaviour**. When something has undefined behaviour, you can have it behave any reasonable way you want - because there is no expectation or assumption of how it should act.

A common question asked throughout the project is usually "How can I test this?" or "Can I test this?". In any situation, most things can be tested thoroughly. However, some things can only be tested sparsely, and on some other rare occasions, some things can't be tested at all. A challenge of this project is for you to use your discretion to figure out what to test, and how much to test. Often, you can use the functions you've already written to test new functions in a black-box manner.

### 🐶 3.6. Iteration 1 Interface

The functions required for iteration 1 are described below.

All error cases should return <code>{error: 'specific error message here'}</code>, where the error message in quotation marks can be anything you like (this will not be marked).

The following are strings: `email`, `password`, `nameFirst`, `nameLast`, `name`, `description`, `oldPassword`, `newPassword`.

The following are integers: `userId`, `quizId`.

For timestamps, these are Unix timestamps in seconds. You can find more information that here https://en.wikipedia.org/wiki/Unix_time. Timestamps should be rounded using `Math.floor()`. 

<table>
  <tr>
    <th>Name & Description</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Error returns</th>
  </tr>
  <tr>
    <td>
      <code>adminAuthRegister</code>
      <br /><br />
      Register a user with an email, password, and names, then return their <code>userId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password, nameFirst, nameLast )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ userId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>Email address is used by another user.</li>
        <li>Email does not satisfy this: <a href="https://www.npmjs.com/package/validator">https://www.npmjs.com/package/validator</a> (validator.isEmail function).</li>
        <li>NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.</li>
        <li>NameFirst is less than 2 characters or more than 20 characters.</li>
        <li>NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes.</li>
        <li>NameLast is less than 2 characters or more than 20 characters.</li>
        <li>Password is less than 8 characters.</li>
        <li>Password does not contain at least one number and at least one letter.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminAuthLogin</code>
      <br /><br />
      Given a registered user's email and password return their <code>userId</code> value.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( email, password )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ userId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>Email address does not exist.</li>
        <li>Password is not correct for the given email.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminUserDetails</code>
      <br /><br />
      Given an admin user's userId, return details about the user.
      <li>"name" is the first and last name concatenated with a single space between them.</li>
      <li>numSuccessfulLogins includes logins direct via registration, and is counted from the moment of registration starting at 1.</li>
      <li>numFailedPasswordsSinceLastLogin is reset every time they have a successful login, and simply counts the number of attempted logins that failed due to incorrect password, only since the last login.</li>
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ user:
  {
    userId,
    name,
    email,
    numSuccessfulLogins,
    numFailedPasswordsSinceLastLogin,
  }
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>userId is not a valid user.</li>
    </td>
  </tr>
  <tr>
  <td>
    <code>adminUserDetailsUpdate</code>
    <br /><br />
    Given an admin user's userId and a set of properties, update the properties of this logged in admin user. 
  </td>
  <td>
    <b>Parameters:</b><br />
    <code>( userId, email, nameFirst, nameLast )</code>
    <br /><br />
    <b>Return type if no error:</b><br />
    <code>{ }</code>
  </td>
  <td>
    <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
    <ul>
      <li>userId is not a valid user.</li>
      <li>Email is currently used by another user (excluding the current authorised user)</li>
      <li>Email does not satisfy this: <a href="https://www.npmjs.com/package/validator">https://www.npmjs.com/package/validator</a> (validator.isEmail)</li>
      <li>NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes</li>
      <li>NameFirst is less than 2 characters or more than 20 characters</li>
      <li>NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes</li>
      <li>NameLast is less than 2 characters or more than 20 characters</li>
    </ul>
  </td>
  </tr>
  <tr>
  </td>
    <td>
      <code>adminUserPasswordUpdate</code>
      <br /><br />
      Given details relating to a password change, update the password of a logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, oldPassword, newPassword )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>userId is not a valid user.</li>
        <li>Old Password is not the correct old password</li>
        <li>Old Password and New Password match exactly</li>
        <li>New Password has already been used before by this user</li>
        <li>New Password is less than 8 characters</li>
        <li>New Password does not contain at least one number and at least one letter</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizList</code>
      <br /><br />
      Provide a list of all quizzes that are owned by the currently logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ quizzes: [
    {
      quizId,
      name,
    }
  ]
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>userId is not a valid user.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizCreate</code>
      <br /><br />
      Given basic details about a new quiz, create one for the logged in user.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, name, description )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ quizId }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>userId is not a valid user.</li>
        <li>Name contains invalid characters. Valid characters are alphanumeric and spaces.</li>
        <li>Name is either less than 3 characters long or more than 30 characters long.</li>
        <li>Name is already used by the current logged in user for another quiz.</li>
        <li>Description is more than 100 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizRemove</code>
      <br /><br />
      Given a particular quiz, permanently remove the quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>userId is not a valid user.</li>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizInfo</code>
      <br /><br />
      Get all of the relevant information about the current quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{
  quizId,
  name,
  timeCreated,
  timeLastEdited,
  description,
}</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>userId is not a valid user.</li>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizNameUpdate</code>
      <br /><br />
      Update the name of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId, name )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>userId is not a valid user.</li>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
        <li>Name contains invalid characters. Valid characters are alphanumeric and spaces.</li>
        <li>Name is either less than 3 characters long or more than 30 characters long.</li>
        <li>Name is already used by the current logged in user for another quiz.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>adminQuizDescriptionUpdate</code>
      <br /><br />
      Update the description of the relevant quiz.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( userId, quizId, description )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
      <b>Return object <code>{error: 'specific error message here'}</code></b> when any of:
      <ul>
        <li>userId is not a valid user.</li>
        <li>Quiz ID does not refer to a valid quiz.</li>
        <li>Quiz ID does not refer to a quiz that this user owns.</li>
        <li>Description is more than 100 characters in length (note: empty strings are OK).</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <code>clear</code>
      <br /><br />
      Reset the state of the application back to the start.
    </td>
    <td>
      <b>Parameters:</b><br />
      <code>( )</code>
      <br /><br />
      <b>Return type if no error:</b><br />
      <code>{ }</code>
    </td>
    <td>
    </td>
  </tr>
</table>


### 🐶 3.7. Authorisation

Elements of securely storing passwords and other tricky authorisation methods are not required for iteration 1. You can simply store passwords plainly, and use the user ID to identify each user. We will discuss ways to improve the quality and methods of these capabilities in the later iterations.

Note that the `userId` variable is simply the user ID of the user who is making the function call. For example,
* A user registers an account with Toohak and is assigned some integer ID, e.g. `42` as their user ID.
* When they make subsequent calls to functions, their user ID - in this case, `42` - is passed in as the `userId` argument.

### 🐶 3.8. Working in parallel

This iteration provides challenges for many groups when it comes to working in parallel. Your group's initial reaction will be that you need to complete registration before you can complete quiz creation, and then quiz creation must be done before you update a quiz name, etc.

There are several approaches that you can consider to overcome these challenges:

* Have people working on down-stream tasks (like the quiz implementation) work with stubbed versions of the up-stream tasks. E.g. The register function is stubbed to return a successful dummy response, and therefore two people can start work in parallel.
* Co-ordinate with your team to ensure prerequisite features are completed first (e.g. Giuliana completes `adminAuthRegister` on Monday meaning Hayden can start `adminQuizCreate` on Tuesday).
* You can pull any other remote branch into your own using the command `git pull origin <branch_name>`.
    * This can be helpful when two people are working on functions on separate branches where one function is a prerequisite of the other, and an implementation is required to keep tests from failing.
* You should pull from `master` on a regular basis to ensure your code remains up-to-date.

### 🐶 3.9. Marking Criteria

<table>
  <tr>
    <th>Section</th>
    <th>Weighting</th>
    <th>Criteria</th>
  </tr>
  <tr>
    <td>Automarking (Testing & Implementation)</td>
    <td>30%</td>
    <td>
      <ul>
      <li>Correct implementation of specified functions.</li>
    </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Test Quality</td>
    <td>15%</td>
    <td>
      Develop tests that show a clear demonstration of:
      <ul>
        <li>Good test <b>coverage</b> - covering the use cases extensively (no need to run a coverage checker in this iteration).</li>
        <li>Good test  <b>clarity</b> in communicating the purpose of tests and code. This includes logical commenting and good variable naming.</li>
        <li>Good test <b>design</b> - thoughtful, clear, and modular layout that follows course examples (black-box testing), with little repetition.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>General Code Quality</td>
    <td>15%</td>
    <td>
      <ul>
        <li>Appropriate use of Javascript data structures (arrays, objects, etc.)</li>
        <li>Appropriate style as covered so far in introductory programming.</li>
        <li>Appropriate layout of files and use of modularity to reduce repetition and improve readability.</li>
        <li>Through comments/naming it is clear what the code is doing via human reading. Error messages aren't marked for quality.</li>
      </ul>
      Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  <tr>
    <td>Git Practices, Project Management, Teamwork</td>
    <td>30%</td>
    <td>
      As an individual, in terms of git:
      <ul>
        <li>For particular features, committing your tests prior to your implementation.</li>
        <li>Your git commit messages are meaningful, clear, and informative. Repeat commit names are avoided.</li>
        <li>You contribute at least 2 meaningful merge requests (approved by another team member) that merge your branch code to master.</li>
      </ul>
      As an individual, in terms of project management and teamwork:
      <ul>
        <li>Attendance to group check ins every week.</li>
        <li>Effective and regular use of course-provided MS Teams for communication (or another app approved by your tutor with evidence added to Teams), demonstrating an ability to competently manage teamwork online.</li>
        <li>Use of issue board on Gitlab OR another equivalent tool that is used to effectively track your tasks.</li>
        <li>Attendance and contributions at your teams meetings and standups, including at least one scenario where you were the leader of the meeting and took the minutes/notes for that meeting.</li>
      </ul>
      As a group, in terms of project management and teamwork:
      <ul>
        <li>Group contract is followed or revised to reflect the team's evolving work patterns.</l1>
      </ul>
     </td>
    <tr>
    <td>Requirements Engineering</td>
    <td>10%</td>
    <td>
      <ul>
        <li>Requirements elicited from potential users, recorded as user stories with acceptance criteria for each, following the correct format from lectures.</li>
        <li>Each user story has a corresponding set of comprehensive user acceptance criteria, in the correct format from lectures.</li>
        <li>User journey justified and expressed as use case(s).</li>
      </ul>
       Whilst we look at your group's work as a whole, if we feel that materially unequal contributions occurred between group members we will assess your individual contribution against this criteria.
    </td>
  </tr>
  </tr>
</table>

For this and for all future milestones, you should consider the other expectations as outlined in section 6 below.

The formula used for automarking in this iteration is:

`Mark = t * i` (Mark equals `t` multiplied by `i`).

Where:
 * `t` is the mark you receive for your tests running against your code (100% = your implementation passes all of your tests).
 * `i` is the mark you receive for our course tests (hidden) running against your code (100% = your implementation passes all of our tests).

### 🐶 3.9. Dryrun

We have provided a very simple dryrun for iteration 1 consisting of a few tests, including your implementation of `adminAuthRegister`, `adminAuthLogin`, `adminQuizCreate`. These only check the format of your return types and simple expected behaviour, so do not rely on these as an indicator of the correctness of your implementation or tests.

To run the dryrun, you should be on a CSE machine (i.e. using `VLAB` or `ssh`'ed into CSE) and in the root directory of your project (e.g. `/project-backend`) and use the command:

```bash
1531 dryrun 1
```

To view the dryrun tests, you can run the following command on CSE machines:
```bash
cat ~cs1531/bin/iter1.test.js
```

Tips to ensure dryrun runs successfully:
* Files sit within the `/src` directory.

### 🐶 3.10. Submission & Teamwork Evaluation

Please see section 6 for information on **due date** and on how you will **demonstrate this iteration**.

Please see section 7.5 for information on **teamwork evaluation**.

### 🐶 3.11. FAQs

Please see the <a href="https://edstem.org/au/courses/21170/discussion/2425607">this EdStem megapost</a> for iteration 1 FAQs.

## 🐝 4. Iteration 2: Building a Web Server

Coming soon.

### 🐝 4.16. FAQs

Please see the <a href="https://edstem.org/au/courses/21170/discussion/2425609">this EdStem megapost</a> for iteration 2 FAQs.

## 🦆 5. Iteration 3: Completing the Lifecycle

Coming soon.

### 🦆 5.13. FAQs

Please see the <a href="https://edstem.org/au/courses/21170/discussion/2425611">this EdStem megapost</a> for iteration 3 FAQs.

## 🌸 6. Due Dates and Weightings

| Iteration | Due date                             | Demonstration to tutor(s)     | Assessment weighting (%) |
| --------- | ------------------------------------ | ----------------------------- | ------------------------ |
| 0         | 8pm Friday 28th Feb (**week 2**)    | No demonstration              | 5% of project mark       |
| 1         | 12pm Tuesday 18th Mar (**week 5**)    | In YOUR **week 5** laboratory | 20% of project mark      |
| 2         | 12pm Tuesday 8th Apr (**week 8**)    | In YOUR **week 8** laboratory | 40% of project mark      |
| 3         | 12pm Thursday 24th Apr (**week 10**)    | Final demonstration week 11   | 35% of project mark      |

For more information about demonstrations see section `6.2`.

### 🌸 6.1. Submission & Late Penalties

To submit your work, simply have your master branch on the gitlab website contain your groups most recent copy of your code. I.E. "Pushing to master" is equivalent to submitting. When marking, we take the most recent submission on your master branch that is prior to the specified deadline for each iteration.

The following late penalties apply depending on the iteration:
 * Iteration 0: No late submissions at all.
 * Iteration 1: No late submissions at all.
 * Iteration 2: No late submissions at all.
 * Iteration 3: Can submit up to 48 hours late, with 5% penalty applied off your mark every time a 24 hour window passes, starting from the due date.

We will not mark commits pushed to master after the final submission time for a given iteration.

If the deadline is approaching and you have features that are either untested or failing their tests, **DO NOT MERGE IN THOSE MERGE REQUESTS**. In some rare cases, your tutor will look at unmerged branches and may allocate some reduced marks for incomplete functionality, but `master` should only contain working code.

## 🏃 6.2. Re-runs

The deadline for reruns and mark reviews is **7 days** from release of each iteration's mark release. Marks are released within 7 days of an iterations' due date.

Minor isolated fixes after the due date are allowed but may carry a penalty to the automark. If the isolated fixes result in a higher automark result (minus the penalty), then we will update your mark. E.g. imagine that your initial automark is 20%, on re-run you get a raw automark of 86%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 86% to 60%, your final **automark** will be 60%.

If the re-run automark after penalty is lower than your initial mark, we will keep your initial mark. E.g. imagine that your initial automark is 50%, on re-run you get a raw automark of 70%, and your fixes attract a 30% penalty: since the 30% penalty will reduce the mark of 70% to 49%, your final **automark** will still be 50% (i.e. your initial mark).

### How to request a re-run

* Create a branch, e.g. `iter[X]-fix`, based off the submission commit.
* Make the minimal number of necessary changes (i.e. only fix the trivial bugs that cost you many automarks).
* Create a merge request for this branch into the iteration's submission branch (i.e. `iterX-submission`), and take note of merge request ID in the URL
  * It is the number at the end of the URL i.e. https://nw-syd-gitlab.cseunsw.tech/COMP1531/25T1/groups/H17B_CRUNCHIE/project-backend/-/merge_requests/67 = 67.
* Log onto the [Gitruns site](https://cgi.cse.unsw.edu.au/~gitrun/) and submit that merge request ID (e.g. 67) for rerun
* Once you submit it, it will take up to 24 hours for you to receive the results of the rerun.
  * The results will appear in status "reviewing", which means an admin still needs to review the penalty.
  * **Please note: The results of the rerun is your RAW automark BEFORE ANY penalties have been applied.**
* Once your MR has been reviewed (this can take up to 72 hours), the status will change to "Complete" and the result will be updated to the mark after penalty
* If the mark after penalty is higher than your current mark, this will then be updated in the grade system, and take 48 hours to propagate to you.

Please note: The current limit on reruns is one every 24 hours. You can submit multiple re-runs before waiting for manual review or mark propagation, as long as they are 24 hours apart.

#### What constitutes a "trivial fix”?
* Fixing spelling/capitalisation/naming issues with values specified in spec documentation
* Swapping a variable type e.g. session from 'number' to 'string'
* Changing the return value type e.g. returning {} rather than null, to match spec documentation
* Changing route versions e.g. v1 to v2 to match spec documentation
* Fixing import values
* Fixing a regex/logical equality check e.g. num === 0 to num === 1
* Fixing constant variable values e.g. loginAttempts = 1 to loginAttempts = 0
* As a general rule, any change that is < 3 lines of code

### 🌸 6.3. Demonstration

#### Iteration 1 & 2 Demonstrations

The demonstrations in weeks 5 and 8 will take place during your lab sessions. All team members **must** attend these lab sessions. Team members who do not attend a demonstration may receive a mark of 0 for that iteration. If you are unable to attend a demonstration due to circumstances beyond your control, you must apply for special consideration.

Demonstrations consist of a 15 minute Q&A in front of your tutor and potentially some other students in your tutorial. For online classes, webcams and audio are required to be on during this Q&A (your phone is a good alternative if your laptop/desktop doesn't have a webcam).

**Note:** If individuals fail to answer questions regarding code written by themselves during an iteration correctly, individual marks may be deducted.

#### Iteration 3 Demonstration

For Iteration 3, you will be demonstrating your work in week 11.

This will consist of a 10 minute presentation and Q&A with 1-2 tutors.

You will be notified via course announcement when you can select the time of your presentation.

If you are in an in-person tutorial, your week 11 presentation will be in-person. If you are in an online tutorial, your week 11 presentation will be online.

More information about the details of this 10 minute presentation will be made available in the iteration 3 part of the spec.

## 👌 7. Individual Contribution

The marks given to you for each iteration are given to you individually. We do however use group marks (e.g. automarking) to infer this, and in many cases, you may receive the same mark as your group members, particularly in cases with well functioning groups. Your individual mark is determined by a combination of the factors below by your tutor, with your group mark as a reference point.Your tutor will look at the following items each iteration to determine your mark:
 * Project check-in
 * Code contribution
 * Tutorial contributions
 * Teamwork evaluation

### 👌 7.1. Project check-in

During your lab class, you and your team will conduct a short standup in the presence of your tutor. Each member of the team will briefly state what they have done in the past week, what they intend to do over the next week, and what issues they have faced or are currently facing. This is so your tutor, who is acting as a representative of the client, is kept informed of your progress. They will make note of your presence and may ask you to elaborate on the work you've done.

Project check-ins are also excellent opportunities for your tutor to provide you with both technical and non-technical guidance.

Your attendance and participation at project check-ins will contribute to your individual mark component for the project. In addition, your tutor will note down any absences from team-organised standups, or deviations from your group contract established during iteration 0.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

The following serves as a baseline for expected progress during project check-ins, in the specified weeks. For groups which do not meet this baseline, teamwork marks and/or individual scaling may be impacted.
| Iteration | Week/Check-in | Expected progress                                                                                                                                     |
| --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | **Week 2**    | Twice-weekly standup meeting times organised, iteration 0 specification has been discussed in a meeting, at least 1 task per person has been assigned |
| 1         | **Week 3**    | Iteration 1 specification has been discussed in a meeting, at least 1 task per person has been assigned                                               |
| 1         | **Week 4**    | 1x function per person complete (tests and implementation in master)                                                                                  |
| 2         | **Week 5**    | Iteration 2 specification has been discussed in a meeting, at least 1 task per person has been assigned                                               |
| 2         | **Week 6**    | **(Checked by your tutor in week 7)** Server routes for all iteration 1 functions complete and in master                                              |
| 2         | **Week 7**    | 1x iteration 2 route per person complete (HTTP tests and implementation in master)                                                                    |
| 3         | **Week 8**    | Iteration 3 specification has been discussed in a meeting, at least 1 task per person has been assigned                                               |
| 3         | **Week 9**    | Exceptions & sessions in HTTP headers added across the project AND 1x iteration 3 route per person complete (HTTP tests and implementation in master)                            |
| 3         | **Week 10**    | 2x iteration 3 routes per person complete (HTTP tests and implementation in master)                            |

### 👌 7.2. Tutorial contributions

From weeks 2 onward, your individual project mark may be reduced if you do not satisfy the following:
* Attend all tutorials.
* Participate in tutorials by asking questions and offering answers.
* [online only] Have your web cam on for the duration of the tutorial and lab.

We're comfortable with you missing or disengaging with 1 tutorial per term, but for anything more than that please email your tutor. If you cannot meet one of the above criteria, you will likely be directed to special consideration.

These are easy marks. They are marks assumed that you will receive automatically, and are yours to lose if you neglect them.

### 👌 7.3. Code contribution

All team members must contribute code to the project to a generally similar degree. Tutors will assess the degree to which you have contributed by looking at your **git history** and analysing lines of code, number of commits, timing of commits, etc. If you contribute significantly less code than your team members, your work will be closely examined to determine what scaling needs to be applied.

Note that **contributing more code is not a substitute for not contributing documentation**.

Please also note that **failure to commit (as an individual) at least once in each week of your iteration may result in up to a 20% mark penalty**. It's critical that you at least demonstrate you can make minor progress each week. If this were an individual assignment we would not enforce this, but given it is a group assignment it's important we encourage you to commit regularly.

### 👌 7.4. Documentation contribution

All team members must contribute documentation to the project to a generally similar degree.

In terms of code documentation, your functions are required to contain comments in JSDoc format, including paramters and return values:

```javascript
/**
  * <Brief description of what the function does>
  * 
  * @param {data type} name - description of paramter
  * @param {data type} name - description of parameter
  * ...
  * 
  * @returns {data type} - description of condition for return
  * @returns {data type} - description of condition for return
*/
```

In each iteration you will be assessed on ensuring that every relevant function in the specification is appropriately documented.

In terms of other documentation (such as reports and other notes in later iterations), we expect that group members will contribute equally.

Note that, **contributing more documentation is not a substitute for not contributing code**.

### 👌 7.5. Teamwork Evaluation

<a href="https://cgi.cse.unsw.edu.au/~cs1531/25T1/project/teamwork-evaluation"><b>Teamwork Evaluation link</b></a>.

**Please note: Failure to complete teamwork evaluation for a particular iteration may result in a mark penalty of 10% for the iteration**

At the end of each iteration, there will be a teamwork evaluation survey where you will rate and leave comments about each team member's contribution to the project up until that point. 

Your other team members will **not** be able to see how you rated them or what comments you left in either teamwork evaluation. If your team members give you a less than satisfactory rating, your contribution will be scrutinised and you may find your final mark scaled down (after review by your tutor).

The following criteria will be assessed by your team members:
* **Participation**: What was the level of participation in group work, attendance at meetings, making suggestions, taking responsibility for tasks, being in communication with the team?
* **Dependability**: How dependable was this team member in delivering assigned tasks, on time, with expected levels of quality? 
* **Team Wellbeing**: How much did this team member contribute to the healthy functioning of the team by communicating with members, coordinating meetings, listening to concerns, facilitating discussion, offering suggestions?
* **Work contribution**: How much did this team member contribute to the development of the major project. 

<table>
  <tr>
    <th>Iteration</th>
    <th>Opens</th>
    <th>Closes</th>
  </tr>
  <tr>
    <td>1</td>
    <td>12pm Tuesday 18th Mar</td>
    <td>12pm Friday 21st Mar</td>
  </tr>
  <tr>
    <td>2</td>
    <td>12pm Tuesday 8th Apr</td>
    <td>12pm Friday 11th Apr</td>
  </tr>
  <tr>
    <td>3</td>
    <td>12pm Thursday 24th Apr</td>
    <td>12pm Monday 28th Apr</td>
  </tr>
</table>

### 👌 7.6. Managing Issues

When a group member does not contribute equally, we are aware it can implicitly have an impact on your own mark by pulling the group mark down (e.g. through not finishing a critical feature), etc.

The first step of any disagreement or issue is always to talk to your team member(s) on the chats in MS Teams. Make sure you have:
1. Been clear about the issue you feel exists.
2. Been clear about what you feel needs to happen and in what time frame to feel the issue is resolved.
3. Gotten clarity that your team member(s) want to make the change.

If you don't feel that the issue is being resolved quickly, you should escalate the issue by talking to your tutor with your group in a project check-in, or alternatively by emailing your tutor privately outlining your issue.

It's imperative that issues are raised to your tutor ASAP, as we are limited in the mark adjustments we can do when issues are raised too late (e.g. we're limited with what we can do if you email your tutor with iteration 2 issues after iteration 2 is due).

## 💻 8. Automarking & Preview

### 💻 8.1. Automarking

Each iteration consists of an automarking component. The particular formula used to calculate this mark is specific to the iteration (and detailed above).

When running your code or tests as part of the automarking, we place a 90 second timer on the running of your group's tests. This is more than enough time to complete everything unless you're doing something very wrong or silly with your code. As long as your tests take under 90 seconds to run, you don't have to worry about it potentially taking longer when we run automarking.

### 💻 8.2. Pre-submission Preview

In the days preceding iterations 1, 2, and 3's due date, we will be running your code against the actual automarkers (the same ones that determine your final mark) and publishing the results of every group on [Gitrun](https://cgi.cse.unsw.edu.au/~cs1531/NOW/content/project/runs). You will get to see the current mark (within a range) of your submission. You will not receive any elaboration on how that mark was determined - if your mark isn't what you expect, work with your group and/or tutor to debug your code and write more tests.

You should have the code you wish to be tested in your `master` branch by **10pm** the night before preview runs.

3x previews are released for iteration 1, 2 and 3. Each preview release will occur at 12pm every second day during the week leading up to the iteration due date. Iteration 1 and 2 previews will occur on Thursday, Saturday and Monday. Iteration 3 previews will occur on Saturday, Monday and Wednesday. 

This preview run gives you a chance to sanity check your automark (without knowing the details of what you did right and wrong), and is just a bit of fun.

Please note the preview mark represents the hidden coursetest/automark performance only - it does not include coverage, linting, group test performance etc. 

## 👀 9. Plagiarism & Academic Misconduct Notice
Your program must be entirely your group’s work. Plagiarism detection software will be used to compare all submissions pairwise (including submissions for similar assignments in previous terms) and serious penalties will be applied, including an entry on UNSW's plagiarism register.

You are also not allowed to submit code obtained with the help of ChatGPT, GitHub Copilot, Gemini or similar automatic tools.
* Do not provide or show your project work to any other person, except for your group and the teaching staff of COMP1531.
* Do not copy ideas or code from others outside your group. 
* Do not use a publicly accessible repository or allow anyone outside your group to see your code, except for the teaching staff of COMP1531. 
* Code generated by ChatGPT, GitHub Copilot, Gemini and similar AI/LLM tools will be treated as plagiarism.

If you knowingly provide or show your assignment work to another person for any reason, and work derived from it is submitted, you may be penalized, even if the work was submitted without your knowledge or consent. This may apply even if your work is submitted by a third party unknown to you.

The penalties for such an offence may include negative marks, automatic failure of the course and possibly other academic discipline. Assignment submissions will be examined both automatically and manually for such submissions.

Please refer to the online resources to help you understand what plagiarism is and how it is dealt with at UNSW:
* <a href="https://www.student.unsw.edu.au/plagiarism/integrity">Academic Integrity and Plagiarism</a>
* <a href="https://www.unsw.edu.au/content/dam/pdfs/governance/policy/2022-01-policies/plagiarismpolicy.pdf">UNSW Plagiarism Policy</a>

The course reserves the right to reassess whether you meet course outcomes through a similar assessment under significant suspicion of academic misconduct. 

## ©️ Copyright Notice
Reproducing, publishing, posting, distributing or translating this assignment is an infringement of copyright and will be referred to UNSW Student Conduct and Integrity for action.