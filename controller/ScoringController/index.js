const _ = require('lodash');
const VError = require('verror');

const { SCORING_STATUSES } = require('../../lib/constants');

const isQuestionMultipleChoice = require('../ChallengeController/lib/isQuestionMultipleChoice');

class ScoringController {
  
  static getMultipleChoiceQuestionScores(challenge, response) {
    const responses = response.responses;

    const multipleChoiceQuestions = _(challenge.sections)
      .map(section => _.filter(section.questions, isQuestionMultipleChoice))
      .reduce((a, b) => a.concat(b), []);

    const questionScores = _(multipleChoiceQuestions)
      .keyBy('id')
      .mapValues((question, id) => ({
        score: ScoringController._getQuestionScore(question, responses[id])
      }))
      .value();
    
    return questionScores;
  }

  static createScoringDoc(challenge) {
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
      sections: sectionScores
    };
  }
  
  static getSectionScores(scoringDoc) {
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

  static assignStatusAndOverallScore(scoringDoc) {
    const sectionScores = ScoringController.getSectionScores(scoringDoc);
    _.assign(scoringDoc, { sections: sectionScores });

    const isEverySectionComplete = !_.some(sectionScores, section => section.score === -1);

    const overallScore = isEverySectionComplete ? _(sectionScores).map('score').mean() : -1;
    const overallStatus = isEverySectionComplete ? SCORING_STATUSES.COMPLETE : SCORING_STATUSES.IN_PROGRESS;
    _.assign(scoringDoc, {
      score: overallScore,
      status: overallStatus
    });

    return scoringDoc;
  }

  // todo johno - refactor this
  static _getQuestionScore(question, questionResponse) {
    const questionType = question.type;

    const questionScore = (() => {
      switch (true) {
        case !questionResponse:
          return 0;
        case (questionType !== questionResponse.type):
          throw new VError(`Response type mismatch: ${question.id} should have response type ${questionType}, got ${questionResponse.type}`);
          break;
        case (isQuestionMultipleChoice(question)):
          return ScoringController._calculateMultipleChoiceScore(question, questionResponse);
        case (questionType === QUESTION_TYPES.FREETEXT):
          return _.isNumber(prevQuestionScore) ? prevQuestionScore : -1;
        default:
          return -1;
      }
    })();
    return questionScore;
  }

  static _calculateMultipleChoiceScore(question, response) {
    const validResponses = _(question.options)
      .filter('isValidSolution')
      .map('id')
      .sortBy()
      .value();

    const electedResponses = _.sortBy(response.response);

    return Number(_.isEqual(validResponses, electedResponses));
  }
}

module.exports = ScoringController;