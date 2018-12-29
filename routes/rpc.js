'use strict'

const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.json({message: 'OK'});
});

module.exports = router;