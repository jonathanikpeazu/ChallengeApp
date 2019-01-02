const express = require('express');
const registerRpcRoutes = require('./registerRpcRoutes');
const RpcResponder = require('./RpcResponder');

module.exports = function getRpcRouter() {
  const rpcResponder = RpcResponder.getInstance();
  registerRpcRoutes(rpcResponder);

  const router = express.Router();

  router.post('/', (req, res) => {
    console.log({ body: req.body });
    return rpcResponder.respond(req, res);
  });

  return router;
};
