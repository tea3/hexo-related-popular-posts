
'use strict';

var logu         = require('log-util');
var PLUGIN_LABEL = "[hexo-related-popular-posts]";
var config;

module.exports.log = function(cat , mes , path , inForce){
  
  var filePath = !(path=="" || !path) ? "\n\nPlease check the following file.\n-> " + path : "";
  if(cat == "success"){
    if(inForce || config.popularPosts.tmp.isLog) logu.debug(PLUGIN_LABEL +" "+ mes + filePath);
  }else if(cat == "info"){
    if(inForce || config.popularPosts.tmp.isLog) logu.info(PLUGIN_LABEL +" "+ mes + filePath);
  }else if(cat == "warn"){
    logu.warn(PLUGIN_LABEL + " warning: " +" "+ mes + filePath);
  }else if(cat == "error"){
    logu.error(PLUGIN_LABEL + " error: " +" "+ mes + filePath);
  }
};

module.exports.setConfig = function(inConfig){
  config = inConfig;
};