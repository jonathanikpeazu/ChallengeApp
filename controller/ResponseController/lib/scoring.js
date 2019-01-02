const _ = require('lodash');

const SCORING_STATUSES = require('../../../lib/constants').SCORING_STATUSES;
const isQuestionMultipleChoice = require('../../../lib/isQuestionMultipleChoice');

const Scoring = {
  createScoringDoc(challenge) {
    const sectionIds = _.map(challenge.sections, 'id');
    const sectionScores = _(sectionIds)
      .mapKeys()
      .mapValues(() => ({score: -1}))
      .value();

    const questionIds = _(challenge.sections)
      .map(section => _.map(section.questions, 'id'))
      .reduce((a, b) => a.concat(b), []);

    const questionScores = _(questionIds)
      .mapKeys()
      .mapValues(() => ({score: -1}))
      .value();

    return {
      status: SCORING_STATUSES.NOT_STARTED,
      score: -1,
      questions: questionScores,
      sections: sectionScores
    };
  },

  getMultipleChoiceQuestionScores(challenge, response) {
    const responses = response.responses;

    const multipleChoiceQuestions = _(challenge.sections)
      .map(section => _.filter(section.questions, isQuestionMultipleChoice))
      .reduce((a, b) => a.concat(b), []);

    const questionScores = _(multipleChoiceQuestions)
      .keyBy('id')
      .mapValues((question, id) => {
        const response = responses[id];
        
        const validResponses = _(question.options)
          .filter('isValidSolution')
          .map('id')
          .sortBy()
          .value();

        const electedResponses = _.sortBy(response.response);

        const score = Number(_.isEqual(validResponses, electedResponses));
        
        return { score };
      })
      .value();

    return questionScores;
  },

  assignStatusAndOverallScore(scoringDoc) {
    const sectionScores = Scoring.getSectionScores(scoringDoc);
    _.assign(scoringDoc, { sections: sectionScores });

    const isEverySectionComplete = !_.some(sectionScores, section => section.score === -1);

    const overallScore = isEverySectionComplete ? _(sectionScores).map('score').mean() : -1;
    const overallStatus = isEverySectionComplete ? SCORING_STATUSES.COMPLETE : SCORING_STATUSES.IN_PROGRESS;
    _.assign(scoringDoc, {
      score: overallScore,
      status: overallStatus
    });

    return scoringDoc;
  },

  getSectionScores(scoringDoc) {
    // note - I don't love doing this (coupling the question ID with the section ID forever), but I'm down a path now and have to go with it for this demo.
    return _(scoringDoc.questions)
      .toPairs() // [ [ question ID, score object ] ]
      .map(pair => ({ sectionId: _(pair[0]).split('_').first(), score: pair[1].score })) // [ [ section ID, score value ] ]
      .groupBy('sectionId') // { section id: [ { score }]
      .mapValues(questionScoresInSection => {
        console.log({ questionScoresInSection });
        const scoreValues = _.map(questionScoresInSection, 'score');
        const isSectionIncomplete = _.some(scoreValues, score => score === -1);

        return {
          score: isSectionIncomplete ? -1 : _.mean(scoreValues)
        };
      })
      .value();
  }
};

module.exports = Scoring;