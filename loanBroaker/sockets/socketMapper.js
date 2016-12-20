'use strict';
let mapper = {};
let socketList = {};

class Mapper {
  constructor() {}

  static getMappedObject(key) {
    return mapper[key];
  }

  static setMappedValue(criteria, key, value) {
    if (mapper[criteria]) {
      mapper[criteria][key] = value;
    } else {
      mapper[criteria] = {};
      mapper[criteria][key] = value;
    }
  }

  static deleteMappedValue(criteria) {
    delete mapper[criteria];
  }

  static getSocket(id) {
    return socketList[id];
  }

  static deleteSocket(id) {
    delete socketList[id];
  }

  static setSocket(id, socket) {
    socketList[id] = {};
    socketList[id] = socket;
  }
}

module.exports = Mapper;