const _ = require('lodash');
const VError = require('verror');

const { SCORING_STATUSES } = require('../../lib/constants');

const isQuestionMultipleChoice = require('../ChallengeController/lib/isQuestionMultipleChoice');

class ScoringController {
  // throws
  static calculateScore(challenge, response) {
    const scoresBySection = _(challenge.sections)
      .keyBy('id')
      .mapValues((section) => {
        const scoresByQuestion = _(section.questions)
          .keyBy('id')
          .mapValues((question, questionId) => {
            const questionType = question.type;
            const questionResponse = response.responses[questionId];

            const score = (() => {
              switch (true) {
                case !questionResponse:
                  return 0;
                case (questionType !== questionResponse.type):
                  throw new VError(`Response type mismatch: ${questionId} should have response type ${questionType}, got ${questionResponse.type}`);
                  break;
                case (isQuestionMultipleChoice(question)):
                  return ScoringController._calculateMultipleChoiceScore(question, questionResponse);
                default:
                  return 1;
              }
            })();

            return { score };
          })
          .value();

        const sectionStatus = ScoringController._getSectionScoringStatus(scoresByQuestion);

        const overallScore = (sectionStatus === SCORING_STATUSES.COMPLETE)
          ? _(scoresByQuestion).values().map('score').mean()
          : -1;

        return { status: sectionStatus, questions: scoresByQuestion, overallScore };
      })
      .value();

    const overallStatus = ScoringController._getScoringStatus(scoresBySection);
    const overallScore = overallStatus === SCORING_STATUSES.COMPLETE
    ? _(scoresBySection).map('overallScore').mean()
      : -1;

    return {
      status: overallStatus,
      overallScore,
      sections: scoresBySection
    };
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

  static _getSectionScoringStatus(sectionScores) {
    const isEveryQuestionComplete = _(sectionScores)
      .values()
      .every(questionScore => questionScore.score > -1);

    return isEveryQuestionComplete ? SCORING_STATUSES.COMPLETE : SCORING_STATUSES.IN_PROGRESS;
  }

  static _getScoringStatus(scoringObject) {
    const isEverySectionComplete = _(scoringObject)
      .values()
      .every(sectionScore => sectionScore.status === SCORING_STATUSES.COMPLETE);

    return isEverySectionComplete ? SCORING_STATUSES.COMPLETE : SCORING_STATUSES.IN_PROGRESS;
  }
}

module.exports = ScoringController;