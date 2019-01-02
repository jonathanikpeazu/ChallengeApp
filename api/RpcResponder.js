const _ = require('lodash');

let instance;
class RpcResponder {
  static getInstance() {
    instance = instance || new this();
    return instance;
  }

  constructor() {
    this._methods = {};
  }

  // registering method is idempotent
  register(namespace, methodConfigs) {
    methodConfigs = _.mapValues(methodConfigs, (method) => {
      // transform any plain string methods to method configs
      let methodConfig;
      if (_.isFunction(method)) methodConfig = { method };
      else methodConfig = method;

      return methodConfig;
    });

    const existingMethodsForNamespace = this._methods[namespace];
    this._methods[namespace] = _.assign(existingMethodsForNamespace, methodConfigs);
  }

  getMethod(namespace, methodName) {
    return _.get(this._methods, [namespace, methodName], null);
  }

  static sendErrorResponse(res, requestId, statusCode, data) {
    if (_.isString(data)) {
      data = { message: data };
    }

    return res.status(statusCode).json(data).end();
  }

  static sendSuccessResponse(res, requestId, result) {
    return res.status(200).json({ result }).end();
  }

  respond(req, res) {
    const id = req.body.id;
    const methodName = req.body.method;
    const params = req.body.params;

    const methodComponents = _.split(methodName, '.');
    const methodConfig = this.getMethod(methodComponents[0], methodComponents[1]);
    if (!methodConfig) {
      return this.constructor.sendErrorResponse(res, id, 400, 'Method not found');
    }

    return methodConfig.method.call(null, params)
      .then(result => this.constructor.sendSuccessResponse(res, id, result))
      .catch((err) => {
        console.error({
          err, params, id, method: methodName,
        }, `ERROR: ${methodName}`);
        return this.constructor.sendErrorResponse(res, id, 500, err.message);
      });
  }
}

module.exports = RpcResponder;
