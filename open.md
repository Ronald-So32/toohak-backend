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

The route is

## How it works

## Usage

# JSON Importing

The route is

## How it works

## Usage

# Adding Attachments

The route is

## How it works

## Usage

# Viewing Attachments

The route is

## How it works

## Usage

# Get Hints

The route is

## How it works

## Usage

# Translate Question

The route is

## How it works

## Usage

# Explain Answer

The route is

## How it works

## Usage
