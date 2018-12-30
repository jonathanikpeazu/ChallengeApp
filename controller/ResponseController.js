const _ = require('lodash');
const ObjectId = require('mongodb').ObjectId;
const VError = require('verror');

const ScoringController = require('./ScoringController');
const { Response, Challenge } = require('../model');
const { RESPONSE_STATUSES } = require('../lib/constants');

class ResponseController {
  static begin(challengeId, uid) {
    const attributes = {
      uid,
      challengeId,
      responses: {},
      status: RESPONSE_STATUSES.IN_PROGRESS,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newResponse = new Response(attributes);

    return newResponse.save().then(() => newResponse);
  }

  static submitResponses(responseId, newResponses) {
    if (_.isEmpty(newResponses)) {
      return Promise.reject(new VError('No responses submitted'));
    }
    
    return Response.findById({ _id: responseId })
      .then(response => {
        if (!response) return Promise.reject(new VError('Response not found'));
        if (response.status !== RESPONSE_STATUSES.IN_PROGRESS) return Promise.reject(new VError('Unable to update response that has been completed'));

        const updatedResponses = _.assign({}, response.responses, newResponses);

        _.assign(response, {
          responses: updatedResponses,
          updatedAt: new Date()
        });

        return response.save();
      })
  }

  static finalize(responseId) {
    try {
      responseId = new ObjectId(responseId);
    } catch (e) {
      return Promise.reject(new VError('Invalid response ID'));
    }

    return Response.findById({ _id: new ObjectId(responseId) })
      .then(response => {
        if (!response) return Promise.reject(new VError('Response not found'));
        if (response.status !== RESPONSE_STATUSES.IN_PROGRESS) return Promise.reject(new VError('Response is already finalized'));

        return Promise.props({
          response: Promise.resolve(response),
          challenge: Challenge.findById({ _id: response.challengeId })
        });
      })
      .then(results => {
        const response = results.response;
        const challenge = results.challenge;
        
        if (!challenge) {
          return Promise.reject(`Challenge not found`);
        }
        
        // todo johno - this is hanging
      })
  }
  
  static findOne(responseId) {
    return Response.findById({ _id: responseId });
  }

  static calculateScore(responseId) {
    return Response.findById({ _id: responseId })
      .then(response => {
        if (!response) return Promise.reject(new VError('Response not found'));

        return Promise.props({
          response,
          challenge: Challenge.findById({ _id: response.challengeId })
        });
      })
      .then(results => {
        const response = results.response;
        const challenge = results.challenge;

        if (!challenge) {
          return Promise.reject(new VError('Challenge not found'));
        }

        const scoresBySection = ScoringController.calculateScore(challenge, response);
        return scoresBySection;
      });
  }
}

module.exports = ResponseController;