const _ = require('lodash');
const VError = require('verror');

const { Response, Challenge } = require('../../model');
const { RESPONSE_STATUSES } = require('../../lib/constants');
const utils = require('./lib/utils');
const Scoring = require('./lib/scoring');
const Validation = require('./lib/validation');

class ResponseController {
  static begin(challengeId, uid) {
    return Challenge.findById(challengeId)
      .then((challenge) => {
        if (!challenge) return Promise.reject(new VError('Challenge not found'));

        const attributes = {
          uid,
          challengeId,
          status: RESPONSE_STATUSES.IN_PROGRESS,
          responses: utils.createResponsesDoc(challenge),
          scoring: utils.createScoringDoc(challenge),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const newResponse = new Response(attributes);

        return newResponse.save();
      });
  }

  // todo - test
  static submitResponses(responseId, newResponses) {
    if (_.isEmpty(newResponses)) {
      return Promise.reject(new VError('No responses submitted'));
    }

    return Response.findById(responseId)
      .then((response) => {
        if (!response) return Promise.reject(new VError('Response not found'));
        if (response.status !== RESPONSE_STATUSES.IN_PROGRESS) return Promise.reject(new VError('Unable to update response that has been completed'));

        const invalidResponses = Validation.getInvalidResponses(response, newResponses);
        if (!_.isEmpty(invalidResponses)) {
          return Promise.reject(new VError(`Invalid responses: ${JSON.stringify(invalidResponses)}`));
        }

        const updatedResponses = _.assign({}, response.responses, newResponses);

        _.assign(response, {
          responses: updatedResponses,
          updatedAt: new Date(),
        });

        return response.save();
      });
  }

  static finalize(responseId, uid) {
    return Response.findById(responseId)
      .then((response) => {
        if (!response) return Promise.reject(new VError(`Response not found: ${responseId}`));
        if (response.status !== RESPONSE_STATUSES.IN_PROGRESS) return Promise.reject(new VError('Response is already finalized'));
        if (response.uid !== uid) return Promise.reject(new VError('Response does not belong to user.'));

        return Promise.props({
          response: Promise.resolve(response),
          challenge: Challenge.findById(response.challengeId)
            .then(challenge => challenge || Promise.reject(new VError('Challenge not found'))),
        });
      })
      .then((results) => {
        const response = results.response;
        const challenge = results.challenge;
        const scoringDoc = response.scoring;

        const multipleChoiceScores = Scoring.getMultipleChoiceQuestionScores(challenge, response);
        _.assign(scoringDoc.questions, multipleChoiceScores);

        Scoring.assignStatusAndOverallScore(scoringDoc);

        // NOTE - This drove me crazy, I have no idea why this is necessary, but it works.
        // Otherwise updatedScoringDoc won't persist in the DB.
        // todo - figure out how to fix this.
        response.scoring = null;
        _.assign(response, {
          status: RESPONSE_STATUSES.COMPLETE,
          scoring: scoringDoc,
          updatedAt: new Date(),
        });

        return response.save();
      });
  }

  static findOne(responseId) {
    return Response.findById(responseId);
  }

  static submitScores(responseId, scoringDocSubmitted) {
    return Response.findById(responseId)
      .then((response) => {
        if (!response) {
          return Promise.reject(new VError(`Response not found: ${responseId}`));
        }

        const invalidQuestionIds = _(scoringDocSubmitted)
          .keys()
          .filter(questionId => !_.has(response.responses, questionId))
          .value();

        if (!_.isEmpty(invalidQuestionIds)) {
          return Promise.reject(new VError(`Invalid question IDs: ${invalidQuestionIds}`));
        }

        const scoringDoc = response.scoring;

        _.each(scoringDocSubmitted, (scoreObj, questionId) => {
          const score = scoreObj.score;
          const notes = scoreObj.notes;

          const questionScore = _.get(scoringDoc.questions, questionId) || {};
          if (_.isNumber(score)) {
            _.set(questionScore, 'score', score);
          }

          if (!_.isEmpty(notes)) {
            _.set(questionScore, 'notes', notes);
          }
        });

        Scoring.assignStatusAndOverallScore(scoringDoc);
        
        // todo - remove updatedAt boilerplate by using a Model mixin.
        response.scoring = null;
        _.assign(response, {
          scoring: scoringDoc,
          updatedAt: new Date(),
        });

        return response.save();
      });
  }
}

module.exports = ResponseController;
