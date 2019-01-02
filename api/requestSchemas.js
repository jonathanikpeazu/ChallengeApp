const Joi = require('joi');

module.exports = {
  Ping: {
    ping: Joi.object({
      message: Joi.string().required(),
    }),
  },
};
