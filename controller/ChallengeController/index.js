const _ = require('lodash');
const VError = require('verror'); // todo - custom error classes
const { Challenge } = require('../../model/index');

const ChallengeValidation = require('./lib/validation');
const removeSolutionsFromChallenge = require('./lib/removeSolutionsFromChallenge');
const isQuestionMultipleChoice = require('./../../lib/isQuestionMultipleChoice');

class ChallengeController {
  static create(attributes) {
    attributes = _.assign(attributes, {
      createdAt: new Date()
    });

    if (!ChallengeValidation.isValidChallenge(attributes)) {
      return Promise.reject(new VError('Invalid challenge attributes'));
    }
    
    _.each(attributes.sections, (section, sectionIndex) => {
      section.id = String(sectionIndex);
      
      section.questions = _.map(section.questions, (question, questionIndex) => {
        // Assign an Object ID to each question
        const completeQuestion = _.assign(question, {
          id: `${sectionIndex}_${questionIndex}`
        });

        // Assign an ID to each multiple choice option
        if (isQuestionMultipleChoice(question)) {
          _.assign(completeQuestion, {
            options: _.map(question.options, (option, index) => _.assign(option, {id: String(index)}))
          });
        }

        return completeQuestion;
      });
    });
    
    const newChallenge = new Challenge(attributes);
    
    return newChallenge.save().then(() => newChallenge);
  }

  static findOne(challengeId, options) {
    options = options || {};

    return Challenge.findById(challengeId)
      .then(challenge => {
        if (!challenge) return Promise.reject(new VError('Challenge not found'));

        return options.includeSolutions ? challenge : removeSolutionsFromChallenge(challenge);
      });
  }
}

module.exports = ChallengeController;
