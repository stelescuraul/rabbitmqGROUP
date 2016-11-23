'use strict';
const q = require('q');

class SoapClient {
  constructor(easySoap, soapOptions) {
    this.soapClient = easySoap.createClient(soapOptions);
    this.soapOptions = soapOptions;
  }

  callMethod(methodName, params) {
    let defer = q.defer();
    this.soapClient.call({
        method: methodName,
        params: params,
      })
      .then((callResponse) => {
        defer.resolve(callResponse.data);
      })
      .catch((err) => {
        defer.reject(new Error(err));
      });
    return defer.promise;
  }
}

module.exports = SoapClient;