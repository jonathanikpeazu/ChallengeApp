const _ = require('lodash');

module.exports = {
  getInvalidResponses(response, newResponses) {
    const invalidResponses = _(newResponses)
      .map((newResponse, questionId) => {
        const responseTemplate = response.responses[questionId];
        if (!responseTemplate) {
          return {questionId, reason: 'Invalid question ID'};
        }
        if (responseTemplate.type !== newResponse.type) {
          return {questionId, reason: `Invalid type: expected ${responseTemplate.type}`};
        }
      })
      .compact()
      .value();
    return invalidResponses;
  }
};
