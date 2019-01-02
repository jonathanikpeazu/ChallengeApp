const _ = require('lodash');
const { Schema } = require('mongoose');

const { QUESTION_TYPES } = require('../../lib/constants');

const QuestionSchema = new Schema({
  type: {
    type: String,
    enum: _.values(QUESTION_TYPES),
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
});

module.exports = QuestionSchema;
