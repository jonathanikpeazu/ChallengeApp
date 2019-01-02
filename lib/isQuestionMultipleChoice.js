const _ = require('lodash');

const constants = require('constants');

module.exports = function isQuestionMultipleChoice(question) {
  return _.includes(
    [constants.QUESTION_TYPES.MULTI_ONE, constants.QUESTION_TYPES.MULTI_MULTI],
    question.type,
  );
};
