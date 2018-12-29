const { ChallengeController } = require('../controller');

// todo - global Promise library
module.exports = function registerRpcRoutes(rpcResponder) {
  rpcResponder.register('Challenge', {
    create: (params) => ChallengeController.create(params.attributes)
  });

  rpcResponder.register('Ping', {
    ping: (params) => Promise.resolve({ message: 'Pinged!', params })
  });
};
