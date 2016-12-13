'use strict';

var hasha  = require('hasha');
var fs     = require('fs');
var pathFn = require('path');

// simple update checker
module.exports.chkUpdate = function(config) {
    if(!config.popularPosts)return "0";
    var settingsStr = JSON.stringify(config.popularPosts);
    var shash       = hasha(settingsStr , {algorithm: 'md5'} );
    return shash;
};

// morphologicalAnalysis's negativeKeywordsList update checker
module.exports.chkUpdate_ngw = function(config) {
    if(!config.popularPosts || !config.popularPosts.morphologicalAnalysis || !config.popularPosts.morphologicalAnalysis.negativeKeywordsList) return "0";
    
    var negativeWordStr = "0";
    var nwPath          = pathFn.join( process.env.PWD || process.cwd() , config.popularPosts.morphologicalAnalysis.negativeKeywordsList );
            
    if(fs.existsSync( nwPath )){
        negativeWordStr = fs.readFileSync( nwPath , "utf-8");
    }
    
    var shash       = hasha(negativeWordStr , {algorithm: 'md5'} );
    return shash;
};

module.exports.getMD5 = function(inStr) {
    if(!inStr || inStr == "") return "";
    
    var shash = hasha(inStr , {algorithm: 'md5'} );
    return shash;
};