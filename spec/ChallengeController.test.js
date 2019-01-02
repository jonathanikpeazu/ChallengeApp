const _ = require('lodash');

require('./Mockgoose');
const mockChallengeData = require('../mock_data/mock_challenge_1');
const isQuestionMultipleChoice = require('../lib/isQuestionMultipleChoice');
const { Challenge } = require('../model');
const ChallengeController = require('../controller/ChallengeController');

let mockChallenge;
beforeEach(() => {
  mockChallenge = new Challenge(mockChallengeData);
  jasmine.clock().install();
});

afterEach(() => {
  jasmine.clock().uninstall();
});

describe('ChallengeController', () => {
  describe('.create', () => {
    it('Assigns IDs to sections and questions', (done) => {
      ChallengeController.create(mockChallengeData).then((newChallenge) => {
        _.each(newChallenge.sections, (section) => {
          expect(section.id).toEqual(jasmine.any(String));

          _.each(section.questions, (question) => {
            expect(question.id).toEqual(jasmine.any(String));
          });
        });

        done();
      });
    });

    it('Requires every multiple choice question to have a valid solution', (done) => {
      const dataWithSolutionsMissing = _.cloneDeep(mockChallengeData);
      _.each(dataWithSolutionsMissing.sections[0].questions[1].options, (option) => {
        option.isValidSolution = false;
      });

      ChallengeController.create(dataWithSolutionsMissing)
        .catch((err) => {
          expect(err).toBeTruthy(); // todo - expect the proper error type.
          done();
        });
    });
  });

  describe('.findOne', () => {
    it('Strips solutions from the challenge object if the withSolutions option is not specified.', (done) => {
      spyOn(Challenge, 'findOne').and.returnValue(Promise.resolve(mockChallenge));

      Promise.all([
        ChallengeController.findOne('abc', { includeSolutions: true })
          .then(result => ({ result, shouldIncludeSolutions: true })),
        ChallengeController.findOne('abc', {})
          .then(result => ({ result, shouldIncludeSolutions: false })),
      ])
        .then((resultConfigs) => {
          _.each(resultConfigs, (resultConfig) => {
            _.each(resultConfig.result.sections, (section) => {
              _.each(section.questions, (question) => {
                if (isQuestionMultipleChoice(question)) {
                  expect(_(question.options).map('isValidSolution').some())
                    .toEqual(resultConfig.shouldIncludeSolutions);
                }
              });
            });
          });

          done();
        });
    });
  });
});
