'use strict';

module.exports = function() {
    
    var mkdirp     = require('mkdirp');
    var pathFn     = require('path');
    var fs         = require('hexo-fs');
    var lg         = require('./log.js');
    var su         = require('./settingsUpdate.js');
    
    var cacheData  = "";
    var cache_path = this.config.popularPosts.tmp.cache_path;
    var gaData     = this.config.popularPosts.tmp.gaData;
    var ndt        = new Date();
    ndt            = ndt.getTime();
    
    lg.setConfig(this.config);
    
    var gaData_removedDeadLink = gaData;
    
    // remove dead link & private page
    var gaData_removedDeadLink = [];
    for(var i = 0; i < gaData.length; i++){
        for(var k = 0; k < this.config.popularPosts.tmp.postPath.length; k++){
            if(this.config.popularPosts.tmp.postPath[k] == gaData[i].path){
                gaData_removedDeadLink.push(gaData[i]);
            }
        }
    }
    
    // generate cache file
    if(cache_path && gaData){
        
        cacheData = JSON.stringify( [{
            "version"   : this.config.popularPosts.tmp.version ,
            "hash"      : this.config.popularPosts.tmp.settingsUpdate ,
            "ngwHash"   : this.config.popularPosts.tmp.negativewordsUpdate ,
            "cachedDate": this.config.popularPosts.tmp.old_cacheDate ,
            "gaData"    : gaData_removedDeadLink
        }] );
        
        // check updating cache file.
        // console.log("Before Cache Hash: " + this.config.popularPosts.tmp.cacheUpdate);
        // console.log("Saved Cache Hash:" + su.getMD5(cacheData));
        if( this.config.popularPosts.tmp.cacheUpdate != su.getMD5(cacheData) ){
        
            cacheData = JSON.stringify( [{
                "version"   : this.config.popularPosts.tmp.version ,
                "hash"      : this.config.popularPosts.tmp.settingsUpdate ,
                "ngwHash"   : this.config.popularPosts.tmp.negativewordsUpdate ,
                "cachedDate": ndt ,
                "gaData"    : gaData_removedDeadLink
            }] );
        
            mkdirp.sync( pathFn.dirname( cache_path ));
            fs.writeFileSync( cache_path , cacheData );
            
            lg.log("info", "saved cache file." , null , false);
        }
    }
};