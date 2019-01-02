const mongoose = require('mongoose');

mongoose.Model.prototype.save = function () {
  return Promise.resolve(this);
};

mongoose.Model.findOne = () => Promise.resolve();
