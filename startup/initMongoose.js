'use strict'

const Promise = require('bluebird');
const mongoose = require('mongoose');

const mongoConfig = require('../config/mongo');

const mongooseOptions = {
  useMongoClient: true,
  promiseLibrary: Promise
};

let initialized = false;

module.exports = function initMongoose() {
  if (initialized) return;
  mongoose.connect(mongoConfig.url, mongooseOptions);
  initialized = true;
};
