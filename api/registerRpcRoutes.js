const { ChallengeController } = require('../controller');

// todo - global Promise library
// todo - dont send back mongo _v and other metadata
module.exports = function registerRpcRoutes(rpcResponder) {
  rpcResponder.register('Challenge', {
    create: (params) => ChallengeController.create(params.attributes),
    findOne: (params) => ChallengeController.findOne(params.id, params.options)
  });

  rpcResponder.register('Ping', {
    ping: (params) => Promise.resolve({ message: 'Pinged!', params })
  });
};
