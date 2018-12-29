'use strict'

const Promise = require('bluebird');
const mongoose = require('mongoose');

const mongoConfig = require('../config/mongo');

console.log({ mongoConfig })

const mongooseOptions = {
  promiseLibrary: Promise,
  useNewUrlParser: true
};

let initialized = false;

module.exports = function initMongoose() {
  if (initialized) return;
  mongoose.connect(mongoConfig.url, mongooseOptions);
  initialized = true;
};
