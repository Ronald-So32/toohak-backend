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

## Usage

# Viewing Attachments

The route is GET /v1/open/attachment/{quizid}

## How it works

## Usage

# Get Hints

The route is GET /v1/open/hint{playerid}

## How it works

## Usage

# Translate Question

The route is GET /v1/open/translate{playerid}

## How it works

## Usage

# Explain Answer

The route is GET /v1/open/explain{playerid}

## How it works

## Usage
