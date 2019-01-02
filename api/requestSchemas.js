const _ = require('lodash');
const Joi = require('joi');
const constants = require('../lib/constants');

module.exports = {
  Ping: {
    ping: Joi.object().keys({
      message: Joi.string().required(),
    })
  },

  Challenge: {
    create: Joi.object().required().keys({
      attributes: Joi.object().required().keys({
        name: Joi.string().required(),
        sections: Joi.array().required().items(Joi.object().required().keys({
          name: Joi.string().required(),
          questions: Joi.array().items(Joi.object().required().keys({
            type: Joi.string().required().valid(_.values(constants.QUESTION_TYPES)),
            prompt: Joi.string().required(),
            options: Joi.array().items(Joi.object().required().keys({
              text: Joi.string().required(),
              isValidSolution: Joi.boolean(),
            })),
          })),
        })),
      }),
    }),

    findOne: Joi.object().required().keys({
      id: Joi.string().required(),
      options: Joi.object().keys({
        includeSolutions: Joi.boolean(),
      }),
    }),
  },

  Response: {
    begin: Joi.object().required().keys({
      uid: Joi.string().required(),
      challengeId: Joi.string().required(),
    }),

    findOne: Joi.object().required().keys({
      id: Joi.string().required(),
    }),

    submitResponses: Joi.object().required().keys({
      id: Joi.string().required(),
      responses: Joi.object().pattern(Joi.string(),
        Joi.object().required().keys({
          // type is validated against question type,
          // so database is source of truth. Helps to avoid race conditions with deployments
          type: Joi.string().required(),
          response: Joi.alternatives()
            .when('type', { is: constants.QUESTION_TYPES.MULTI_MULTI, then: Joi.array().items(Joi.string()) })
            .when('type', { is: constants.QUESTION_TYPES.MULTI_ONE, then: Joi.array().items(Joi.string()) })
            .when('type', { is: constants.QUESTION_TYPES.FREETEXT, then: Joi.string() })
            .required(),
        })),
    }),

    finalize: Joi.object().required().keys({
      id: Joi.string().required(),
      uid: Joi.string().required(),
    }),

    submitScores: Joi.object().required().keys({
      id: Joi.string().required(),
      scoring: Joi.object().pattern(Joi.string(), Joi.object().required().keys({
        score: Joi.number().required(),
        notes: Joi.string(),
      })),
    }),
  },
};
