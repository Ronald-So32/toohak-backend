# CSV Exporting

The route is GET /v1/open/csv/{quizid}/{playerid}

## How it works
To export a player result as a CSV file, you need to be the creator of the quiz.
The player result has 2 arrays of objects, usersRankedByScore and questionResults.
Each of those are turned into a CSV format which is then exported into a CSV file each.
Both of them are combined into one string seperated by a newline in between.
This combined string is also exported into a TXT file instead of CSV.
It is also used as the return value for the backend to check.

## Usage
Game results in the database can be easily deleted with a click of a button.
What is the best way to store the player's results?
Maybe it was an important score that was very impressive or needed for evidence.
You can now export it into a CSV file.

# JSON Exporting

The route is GET /v1/open/export/{quizid}

## How it works
Exporting a quiz into a JSON requires you to be the owner of the quiz.
Only the important details of the quiz will be exported.
It will be stored in a JSON file.

## Usage
Needing to export a quiz to share with others?
This is the route to do just that.
It will capture all the needed parts of the quiz.

# JSON Importing

The route is POST /v1/open/import

## How it works
This works by extracting the contents of the file.
It then tries to create a quiz with all of it's questions and thumbnail if any under your name.
If anything is incorrect then it will throw an error.

## Usage
Found a good quiz online and want to edit it?
Now you can, just ensure the JSON file is in the correct format.
It will then create a new quiz under your name.
You can then edit it afterwards.

# Adding Attachments

The route is PUT /v1/open/attachment/{quizid}

## How it works
To add attachments to a quiz, you need to turn whatever you have into a string.
Music links, youtube links, embeded links, pdf links, sharepoint links, mega links.
Anything that is on the internet can be stored as a string.
If the attachment is not in a string format, no problem.
Files are just a bunch of ones and zeroes, just base64 encode it into a string.
End users can decode it afterwards using the same base64 algorithm.
The attachment is an array of strings, allowing for multiple attachments in one quiz.

## Usage
If you needed to add something that you could not in the base game now its possible.
With attachments you can attach anything to your quiz.
Just as long as you can make it into a string, it is possible to attach anything.
I am only allowed to modify the backend, the frontend can decide how to view this.
Things like base64 things can be decoded.

# Viewing Attachments

The route is GET /v1/open/attachment/{quizid}

## How it works
To view an attachment you will need the quiz and then attachment number.
If the attachment number is not valid then it will throw an error.

## Usage
Currently there is no way to view the attachment.
Once it is attached to the quiz it will never be seen again.
Just call the route to get the specific attachment on a quiz, you will need to be an owner though.

# Get Hints

The route is GET /v1/open/hint{playerid}

## How it works
Must be used on a running game on the question open state.
It will throw out the hint if all the conditions are met.

## Usage
Stuck on a question?
Just call the hint route and you'll get hints for the current question.

# Translate Question

The route is GET /v1/open/translate{playerid}

## How it works
Must be used on a running game on the question open state.
Give the language to translate and the llm will try its best.
It will throw out the translation of the question if all the conditions are met.

## Usage
Just call the translate route if you don't understand a question.
Also needs a language to translate to.

# Explain Answer

The route is GET /v1/open/explain{playerid}

## How it works
Must be used on a running game on the answer state.
Just call the route and it will explain why the answer is that to the question.

## Usage
Don't understand the answer?
This route will explain it to you.
