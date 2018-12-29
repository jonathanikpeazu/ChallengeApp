const _ = require('lodash');
const ObjectId = require('mongodb').ObjectId;

const { Response } = require('../model');
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
}

module.exports = ResponseController;