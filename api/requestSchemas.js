const _ = require('lodash');
const Joi = require('joi');
const constants = require('../lib/constants');

module.exports = {
  Ping: {
    ping: Joi.object({
      message: Joi.string().required(),
    }),
  },

  Challenge: {
    create: Joi.object({
      attributes: Joi.object({
        name: Joi.string().required(),
        sections: Joi.array().required().items(Joi.object({
          name: Joi.string().required(),
          questions: Joi.array().items(Joi.object({
            type: Joi.string().required().valid(_.values(constants.QUESTION_TYPES)),
            prompt: Joi.string().required(),
            options: Joi.array().items(Joi.object({
              text: Joi.string().required(),
              isValidSolution: Joi.boolean()
            })),
          })),
        })),
      }),
    }),
  },
};
