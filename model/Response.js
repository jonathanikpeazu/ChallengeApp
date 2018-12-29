const _ = require('lodash');
const mongoose = require('mongoose');

const { RESPONSE_STATUSES } = require('../lib/constants');

const responseSchema = mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  responses: {
    type: mongoose.Schema.Types.Map
  },
  status: {
    type: String,
    required: true,
    enum: _.values(RESPONSE_STATUSES)
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  }
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;