const _ = require('lodash');
const VError = require('verror'); // todo - custom error classes
const { ObjectId } = require('mongodb');
const { Challenge } = require('../../model/index');

const ChallengeValidation = require('./lib/ChallengeValidation');
const removeSolutionsFromChallenge = require('./lib/removeSolutionsFromChallenge');
const isQuestionMultipleChoice = require('./lib/isQuestionMultipleChoice');

const constants = require('../../lib/constants');

class ChallengeController {
  static create(attributes) {
    attributes = _.assign(attributes, {
      createdAt: new Date()
    });

    if (!ChallengeValidation.isValidChallenge(attributes)) {
      return Promise.reject(new VError('Invalid challenge attributes'));
    }
    
    _.each(attributes.sections, section => {
      section.questions = _.map(section.questions, question => {
        // Assign an Object ID to each question
        const completeQuestion = _.assign(question, {
          _id: new ObjectId()
        });

        // Assign an ID to each multiple choice option
        if (isQuestionMultipleChoice(question)) {
          _.assign(completeQuestion, {
            options: _.map(question.options, (option, index) => _.assign(option, {id: index}))
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
    
    try {
      challengeId = new ObjectId(challengeId);
    } catch (err) {
      return Promise.reject(new VError(err, 'Invalid challenge ID'));
    }

    return Challenge.findOne({ _id: challengeId })
      .then(challenge => {
        if (!challenge) return Promise.reject(new VError('Challenge not found'));

        return options.includeSolutions ? challenge : removeSolutionsFromChallenge(challenge);
      });
  }
}

module.exports = ChallengeController;
