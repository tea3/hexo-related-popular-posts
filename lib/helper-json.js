'use strict';

module.exports = function(options , inPost , inHexo) {
    var lj = require('./list-json.js');
    // var list = lj.getList(options , this);
    var list = lj.getList(options , inPost , inHexo);
  return list;
}