
n.n.n / 2025-04-14
==================

  * Fix: In quiz.ts fixed issue where change of property name of thumbnail to thumbnailUrl caused error
  * Merge branch 'Feature/POST/v2/admin/quiz/{quizid}/question' into Feature/GET/v2/admin/quiz/{quizid}
  * Fix: Used lint-fix to fix existing styling issues in quiz.ts and POSTv2adminQuiz{quizid}Question.test.ts
  * Update: In POSTv2adminQuiz{quizid}Question.test.ts changed all adminQuizQuestionCreate to using V2
  * Update: In testHelper.ts changed the usage of makeRequest for all wrapper and fixed issue with questionBody for V2 questionCreate and Update
  * Fix: In quiz.ts fixed the implementation of aminQuizQuestionCreateV2 where error checking for thumbnail doesn't work properly
  * Feature: In POSTv2adminQuiz{quizid}Question.test.ts created test cases for thumbnailUrl
  * Update: In POSTv2adminQuiz{quizid}Question.test.ts updated all the question body used for requestAdminQuizQuestionCreate and made comments for thumbnailUrl in parts not yet implemented
  * Update: In dataStore.ts updated the name of the thumbnail property to thumbnailUrl and also made thumbnail also temporary for question interface (Needs to be changed after)
  * Merge branch 'Feature/DELETE-v2/admin/quiz/quizid' into Feature/POST/v2/admin/quiz/{quizid}/question
  * Fix: Used lint-fix to fix styling errors and also moved intended changes of DELETEadminQuiz{quizid}.test.ts to DELETEv2adminQuiz{quizid}.test.ts instead, reverting changes made in the v1 which was meant for v2
  * Fix: In dataStore.ts and DELETEadminQuiz{quizid}.test.ts made the thumbnailUrl property a temporary comment
  * Feature: In DELETEadminQuiz{quizid}.test.ts added an additional test case for status code 401 and 403 with test case for status code 400 also implemented but COMMENTED
  * Feature: In dataStore.ts, added a thumbnailUrl property in the questions Interface and updated it's header
  * Update: Added a thumbnail to the quiz interface in dataStore.ts
  * Update: Updated the error messages in functionsHelper.ts and updated the function in quiz.ts to error check the active games
  * Update: Updated the dataStore.ts for new iteration 3 stuff
  * Fix: Fixed the incorrect route in server.ts
  * Fix: Fixed the incorrect route in server.ts
  * Feature: Implemented the route for quiz remove v2
  * Fix: Moved the validation of thumbnail before calling the v1 route in quiz.ts
  * Feature: Started implementing the function for the v2 route for quiz remove in quiz.ts
  * Feature: Implemented the v2 route for get quiz in server.ts
  * Feature: Implemented the v2 route for get quiz in quiz.ts and updated the interface in functionsHelper.ts
  * Feature: Implemented the V2 route for question create in server.ts
  * Update: Added the error checking in the new v2 function in quiz.ts, updated the error class in functionsHelper.ts and added a todo comment in POSTv2adminQuiz[quizid}Question.test.ts
  * Update: Updated the question create v2 functionin quiz.ts
  * Feature: Started on a v2 function in quiz.ts and updated dataStore.ts
  * Update: Added the missing field in the new v2 route in POSTv2adminQuiz[quizid}Question.test.ts
  * Update: Updated the test in GETv2adminQuiz[quizid}.test.ts
  * Update: Updated the tests in DELETEv2adminQuiz{quizid}.test.ts
  * Update: Finished the rest of the wrappers in testsHelper.ts
  * Update: Created player.ts
  * Feature: Created wrapper functions for the routes in testsHelper.ts
  * Update: Created all the test files with temporary tests to make it pass
  * Update: Created the files for the v2 routes by copy pasting the v1 test files
  * Feature: Copy pasted the v1 test file for the new v2adminQuiz[quizid} route
  * Merge branch 'Feature/Password-Hashing/Iteration3' into 'master'
  * Update: Updated style in functionsHelper.ts using eslint
  * Update: Updated all passwords to use hashing in auth.ts
  * Feature: Impemented a function to hash in functionsHelper.ts
  * Merge branch 'update-4a64631956d0c2dc59d77ace204abfc53c752d5e' into 'master'
  * Merge branch 'master' into 'update-4a64631956d0c2dc59d77ace204abfc53c752d5e'
  * Merge branch 'Feature/Convert-Try-Catch/Iteration3' into 'master'
  * Merge branch 'master' into Feature/Convert-Try-Catch/Iteration3
  * Update: Updated validator to a newer version in package.json
  * Update: Fixed the incorrect errorcode in auth.ts and cleaned up the routes in server.ts
  * Update: Updated style in all files using eslint
  * Fix: Reverted the deleted function call and redundant consts in server.ts
  * Update: Removed the rest of the old error returns in server.ts
  * Update: Updated all invalidQuiz errors to be FORBIDDEN in quiz.ts
  * Update: Changed all noPermission errors to FORBIDDEN instead of BADREQUEST in quiz.ts
  * Update: Removed most if error statements in server.ts
  * Updated every catch block to return the error in server.ts
  * Update: Moved everything inside all routes to be inside the try block in server.ts
  * Update: Finished the rest of the throw errors conversion in quiz.ts
  * Update: Even more throws in the quiz.ts functions
  * Update: Updated some more functions to use the throw in quiz.ts
  * Update: Started updating quiz.ts functions to throw errors with status code 400 (will change later)
  * Update: Updated all functions in auth.ts to throw errors instead of objects
  * Update: Removed all errorInterface returns in auth.ts
  * Update: Removed all errorInterface returns in quiz.ts
  * Fix: Fixed the return type in functionsHelper.ts
  * Fix: Removed redundant error return for the helper in quiz.ts
  * Fix: Fixed the rest of the helper functions in quiz.ts
  * Update: Updated some functions in auth.ts and quiz.ts to use the new helpers
  * Fix: Fixed all return types in functionsHelper.ts
  * Update: Finished the rest of the conversion in functionsHelper.ts
  * Update: Converted more to use throw errors in functionsHelper.ts
  * Update: Updated a bunch of helper functions to throw errors instead of objects in functionsHelper.ts
  * Update: Updated a function helper to throw errors in functionsHelper.ts
  * Update: Updated the functions that used that helper in auth.ts
  * Update: Changed the helper function in functionsHelper.ts
  * Update: Removed the if statement in server.ts
  * Update: Used the new BetterErrors instead of the old one in auth.ts and server.ts
  * Update: Used the status codes from the return instead of hard coding it in server.ts
  * Update: Cooked with the betterError class in auth.ts and added an enum for all the error codes in functionsHelper.ts
  * Feature: Implemented a new error class that extends from the built in Error class
  * Update: Added try catch blocks to every route in server.ts
  * Task update 4a64631956d0c2dc59d77ace204abfc53c752d5e
  * Merge branch 'master' of nw-syd-gitlab.cseunsw.tech:COMP1531/25T1/STAFF/repos/project-backend
  * Add missing coverage and dependencies to iter3
  * Merge changes from starter code into 'master'
  * Task update 5f30d12cb5263bc50f179d5d729881311b07de50
  * Merge branch 'iter-3' into 'master'
  * Iter 3
  * Merge branch 'iter-3' into 'master'
  * Iter 3
  * Iteration 3 Ready
  * Rename `newecho.test.js` to `newecho.test.ts` to resolve errors
  * Update: Updated the details function in auth.ts to throw errors
  * Feature: Implemented the try catch for details in server.ts
  * Update: Updated the login function in auth.ts to throw errors instead of objects
  * Feature: Implemented try catch in server.ts for the login route
  * Update: Updated the errors in auth.ts to throw errors instead of an error object
  * Update: updated the function in auth.ts to throw errors instead of error objects
  * Feature: Implemented try and catch on the register route in server.ts
