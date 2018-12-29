const _ = require('lodash');
const { Challenge } = require('../model');

class ChallengeController {
  static create(attributes) {
    attributes = _.assign(attributes, {
      createdAt: new Date()
    });
    
    const newChallenge = new Challenge(attributes);
    
    return newChallenge.save().then(() => newChallenge);
  }
}

module.exports = ChallengeController;
