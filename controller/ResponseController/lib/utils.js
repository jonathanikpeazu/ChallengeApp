const _ = require('lodash');

module.exports = {
  // create map of { [questionId]: { type, response }
  createResponsesDoc(challenge) {
    const questionsById = _.chain(challenge.sections)
      .map('questions')
      .reduce((a, b) => a.concat(b), [])
      .keyBy('id')
      .value();

    return _.mapValues(questionsById, question => ({
      type: question.type,
      response: null
    }));
  }
};
