'use strict'

const _ = require('lodash');

const isQuestionMultipleChoice = require('./../../../lib/isQuestionMultipleChoice');


module.exports = function removeSolutionsFromChallenge(challenge) {
  const challengeClone = _.cloneDeep(challenge);
  
  return _.assign(challengeClone, {
    sections: _.map(challengeClone.sections,
      section => _.assign(section, {
        questions: _.map(section.questions,
          question => {
            
            // strip answer if question is multiple choice
            if (isQuestionMultipleChoice(question)) {
              return _.assign(question, {
                options: _.map(question.options, option => _.omit(option, 'isValidSolution'))
              });
            } else {
              return question;
            }
          })
      }))
  });
};
