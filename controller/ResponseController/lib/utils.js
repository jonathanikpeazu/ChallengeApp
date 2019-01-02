const _ = require('lodash');

const { SCORING_STATUSES } = require('../../../lib/constants');

module.exports = {
  // create map of { [questionId]: { type, response }
  createResponsesDoc(challenge) {
    const questionsById = _.chain(challenge.sections)
      .map('questions')
      .reduce((a, b) => a.concat(b), [])
      .keyBy('id')
      .value();

    return _.mapValues(questionsById, question => ({
      type: question.type,
      response: null,
    }));
  },

  createScoringDoc(challenge) {
    const sectionIds = _.map(challenge.sections, 'id');
    const sectionScores = _(sectionIds)
      .mapKeys()
      .mapValues(() => ({ score: -1 }))
      .value();

    const questionIds = _(challenge.sections)
      .map(section => _.map(section.questions, 'id'))
      .reduce((a, b) => a.concat(b), []);

    const questionScores = _(questionIds)
      .mapKeys()
      .mapValues(() => ({ score: -1 }))
      .value();

    return {
      status: SCORING_STATUSES.NOT_STARTED,
      score: -1,
      questions: questionScores,
      sections: sectionScores,
    };
  },
};
