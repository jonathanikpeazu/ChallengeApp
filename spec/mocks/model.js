const proxyquire = require('proxyquire');
const Mockgoose = require('../Mockgoose');

module.exports = {
  Challenge: proxyquire('../../model/Challenge', { mongoose: Mockgoose }),
  Response: proxyquire('../../model/Response', { mongoose: Mockgoose }),
};
