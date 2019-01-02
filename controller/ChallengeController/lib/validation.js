const _ = require('lodash');

const isQuestionMultipleChoice = require('./../../../lib/isQuestionMultipleChoice');

const ChallengeValidation = {
  isValidChallenge(attributes) {
    return (
      !_.isEmpty(attributes.sections)
      && _.every(attributes.sections, section => ChallengeValidation.isValidSection(section))
    );
  },

  isValidSection(section) {
    return (
      !_.isEmpty(section.questions)
      && _.every(section.questions, question => ChallengeValidation.isValidQuestion(question))
    );
  },

  isValidQuestion(question) {
    // multiple choice questions must have a list of possible options
    // with at least one valid solution.
    if (isQuestionMultipleChoice(question)) {
      if (_.isEmpty(question.options)) {
        return false;
      }

      if (!_(question.options).map('isValidSolution').some()) {
        return false;
      }
    }

    return true;
  },
};

module.exports = ChallengeValidation;
