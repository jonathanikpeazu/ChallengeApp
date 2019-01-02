# ChallengeApp

## Getting started
This ChallengeApp implementation will set up a new MongoDB instance and Node server on your local machine. Ideally, I would ship this as a Docker container (or pair of Docker containers), but I did not have time for this demo.

Steps to run locally:
- Clone the repo from GitHub:
`$ git clone https://github.com/jonathanikpeazu/ChallengeApp.git`

- Run the install script. This will install mongodb to your machine via Homebrew, and create the local Mongo data directory:
`$ cd ChallengeApp`
`$ ./install.sh`

- Start the server. If you encounter the error `Block-scoped declarations not yet supported`, you may have to upgrade your version of Node.:
`$ node ./bin/www
   { mongoConfig: { url: 'mongodb://localhost:27017/challenge_app' } }`

- Use cURL or the provided ChallengeApp.paw file to send requests to the JSONRPC-style API:
`$ curl -X "POST" "http://localhost:3000/rpc" \
        -H 'Content-Type: application/json' \
        -d $'{
     "id": "1",
     "method": "Ping.ping"
   }'
   {}`

## API Documentation
### Overview
For this project, I decided to go with a JSONRpc-style API, rather than REST. REST is a great framework for serving and storing static web pages, but for large, interconnected applications where operations may have side-effects or affect multiple types of entities (especially ones that are not named in the request), it becomes nearly impossible to remain purely RESTful.

JSONRPC is a good alternative because it requires less boilerplate, is easy to document, lends itself easily to batching requests (submit an array of methods instead of a single one) and since it is transport-agnostic (doesn't hard-code HTTP request types), it is easy to migrate to web sockets or any other transport protocol.

### Data Model
There are two main data types in this demo:
- A `Challenge` is created by an administrator by uploading a JSON document.
- A `Response` is created by a user in response to a `Challenge`.

#### Challenge
A Challenge document contains questions, broken up into sections. Each section and question are assigned an `id` upon creation.

#### Response
A Response document contains responses to a Challenge document.

- Upon creation, the Response document contains placeholder responses for each question. This allows us to do typechecking during `Response.submitResponses` without having to look up the original Challenge document.
- The response and scoring subdocuments are both keyed by the `id`s assigned in the Challenge creation phase, to simplify response submission code and allow databases to index this data much more efficiently. Ex. It is difficult/awkward to index the field "score" of an object at the second element in an array.
- The scoring subdocument contains an overall score, pluse a field called "questions" and a field called "sections", so that we can query by overall score, question score, or section score. Scoring is either `NOT_STARTED`, `IN_PROGRESS`, or `COMPLETE`. Each score is `-1` until they have been graded.

### Using the API
Since I have provided a PAW file with sample data, I will not fully explain the data schemas in this doc. Instead, I will walk through a simple flow to test all of the features:

#### 1) Create a new challenge
Create a new challenge using the `Challenge.create` method. This will yield a new challenge. Use the `_id` of this document for `Challenge.findOne` and to create new responses. User-facing APIs should use `Challenge.findOne` without the flag `includeSolutions`.

#### 2) Create a new user response
Use `Response.begin` using the challengeId from `Challenge.create` and any old made-up `uid`. This will create a new `_IN_PROGRESS` Response document, which includes blank response templates and an empty scoring document.

#### 3) Submit responses
Use `Response.submitResponses` to submit batches of responses. You can submit responses many- or one-at a time, breaking the test into as many requests as you like.

#### 4) Finalize your response
Use `Response.finalize` to close your response document, allowing it to be graded. At this point, multiple-choice scores will be calculated, updating the `scoring` object on the response doc. The response itself will have a score, along with each individual question and section. `scoring.status` will either be `IN PROGRESS` or `COMPLETE` depending on whether there are outstanding freetext questions.

#### 5) Submit scores for freetext responses.
Use `Response.submitScores` to give feedback on a user's finalized freetext responses. As with `submitResponses`, this can be done in multiple requests. `Scoring.status` will equal `COMPLETE` when all questions have been scored.

### Design considerations
#### Schema validation
In a world of un-typed languages, things can get hairy, so it's important not to let garbage get into your database. This can be achieved by adding validation code to your controller functions, but I prefer to front-load this in the server layer when possible by defining `Joi` schemas for each request in `api/requestSchemas`. This simplifies both server and test code and leads to less duplication and boilerplate. It also has the benefit of being config-driven and self-documenting. There is still additional, more complex validation code in the controller layer, such as checking for the correct response type during `Response.submitResponses`.

#### Model / Controller design
Mongoose offers the freedom to add custom pre-save hooks, class methods, etc. to our data model. However, I made the decision to keep all business logic (ex. assigning question/section IDs on the Challenge object in `Challenge.create`),to keep a nice decoupling between business logic, view logic, and database code. This is an advantage in case a technology migration ever needs to happen in the future.

