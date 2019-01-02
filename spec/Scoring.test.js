const _ = require('lodash');

require('./Mockgoose');
const Scoring = require('../controller/ResponseController/lib/scoring');
const { ChallengeController, ResponseController } = require('../controller');
const { Response } = require('../model');
const mockChallengeData = require('./mock_data/mock_challenge_1.json');
const mockResponseData = require('./mock_data/mock_response_1.json');

let response;
beforeEach(() => {
  response = new Response(mockResponseData);
});

describe('Scoring', () => {
  it('Calculates multiple choice question scores correctly', (done) => {
    let challenge;

    ChallengeController.create(mockChallengeData)
      .then((newChallenge) => {
        challenge = newChallenge;
      })
      .then(() => {
        const multipleChoiceScoresEmpty = Scoring.getMultipleChoiceQuestionScores(challenge, response);
        expect(multipleChoiceScoresEmpty).toEqual({
          '0_1': { score: 0 },
          '1_0': { score: 0 },
        });

        response.responses['0_1'].response = ['2'];
        const multipleChoiceScores = Scoring.getMultipleChoiceQuestionScores(challenge, response);
        expect(multipleChoiceScores).toEqual({
          '0_1': { score: 1 },
          '1_0': { score: 0 },
        });

        done();
      });
  });
});
