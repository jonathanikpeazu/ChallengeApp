const _ = require('lodash');
const VError = require('verror'); // todo - custom error classes
const { ObjectId } = require('mongodb');
const { Challenge } = require('../model');

const constants = require('../constants');

class ChallengeController {
  static create(attributes) {
    attributes = _.assign(attributes, {
      createdAt: new Date()
    });
    
    if (!this.isValidChallenge(attributes)) {
      return Promise.reject(new VError('Invalid challenge attributes'));
    }
    
    _.each(attributes.sections, section => {
      section.questions = _.map(section.questions, question => _.assign(question, { _id: new ObjectId() }))
    });
    
    const newChallenge = new Challenge(attributes);
    
    return newChallenge.save().then(() => newChallenge);
  }
  
  // todo - TEST
  static isValidChallenge(attributes) {
    return (
      _.isPlainObject(attributes)
      && !_.isEmpty(attributes.name)
      && !_.isEmpty(attributes.sections)
      && _.every(attributes.sections, section => this.isValidSection(section))
    );
  }
  
  static isValidSection(section) {
    return (
      _.isPlainObject(section)
      && !_.isEmpty(section.name)
      && !_.isEmpty(section.questions)
      && _.every(section.questions, question => this.isValidQuestion(question))
    );
  }
  
  static isValidQuestion(question) {
    
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
    
    // multiple choice questions must have a list of possible options
    if (
      _.includes([constants.QUESTION_TYPES.MULTI_ONE, constants.QUESTION_TYPES.MULTI_MULTI], question.type)
      && _.isEmpty(question.options)
    ) {
      return false;
    }
    
    return true;
  }
}

module.exports = ChallengeController;
