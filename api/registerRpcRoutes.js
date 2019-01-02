const { ChallengeController, ResponseController } = require('../controller');

module.exports = function registerRpcRoutes(rpcResponder) {
  
  rpcResponder.register('Challenge', {
    create: (params) => ChallengeController.create(params.attributes),
    findOne: (params) => ChallengeController.findOne(params.id, params.options)
  });
  
  rpcResponder.register('Response', {
    begin: (params) => ResponseController.begin(params.challengeId, params.uid),
    findOne: (params) => ResponseController.findOne(params.id),
    submitResponses: (params) => ResponseController.submitResponses(params.id, params.responses),
    submitScores: (params) => ResponseController.submitScores(params.id, params.scoring),
    finalize: (params) => ResponseController.finalize(params.id, params.uid)
  });

  rpcResponder.register('Ping', {
    ping: (params) => Promise.resolve({ message: 'Pinged!', params })
  });
  
};
