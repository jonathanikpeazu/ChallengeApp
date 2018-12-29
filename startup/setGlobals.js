const bluebird = require('bluebird');

module.exports = function setGlobals() {
  global.Promise = bluebird;
};
