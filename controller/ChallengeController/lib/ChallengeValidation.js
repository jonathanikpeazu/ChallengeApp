const _ = require('lodash');

const constants = require('../../../lib/constants');
const isQuestionMultipleChoice = require('./isQuestionMultipleChoice');

// todo - TEST
const ChallengeValidation = {
  isValidChallenge(attributes) {
    return (
      _.isPlainObject(attributes)
        && !_.isEmpty(attributes)
      && !_.isEmpty(attributes.name)
      && !_.isEmpty(attributes.sections)
      && _.every(attributes.sections, section => ChallengeValidation.isValidSection(section))
    );
  },

  isValidSection(section) {
    return (
      _.isPlainObject(section)
      && !_.isEmpty(section.name)
      && !_.isEmpty(section.questions)
      && _.every(section.questions, question => ChallengeValidation.isValidQuestion(question))
    );
  },

  isValidQuestion(question) {

    // if it's not an object, or is missing "type" or "prompt", return false.
    if (!_.isPlainObject(question)
      || _.some(['type', 'prompt'], field => _.isEmpty(question[field]))) {
      return false;
    }

    // if it's an invalid question type, return false.
    if (!_(constants.QUESTION_TYPES)
        .values()
        .includes(question.type)) {
      return false;
    }

    // multiple choice questions must have a list of possible options, including at least one valid solution
    if (isQuestionMultipleChoice(question)) {
      if (_.isEmpty(question.options)) {
        return false;
      }

      if (!_(question.options).map('isValidSolution').some()) {
        return false;
      }
    }

    return true;
  }
};

module.exports = ChallengeValidation;