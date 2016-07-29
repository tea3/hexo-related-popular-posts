'use strict';

module.exports = function(options) {
    var lj = require('./list-json.js');
    var list = lj.getList(options , this);
  return list;
}