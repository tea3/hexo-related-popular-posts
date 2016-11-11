'use strict';

var Promise = require('bluebird');
var util    = require('./util.js');
var ma      = require('./morphologicalAnalysis-jp');


module.exports = function(post) {
    var _this = this;
    
    return checkUpdate(this, post)
        .then(morphologicalAnalysis)
        .then(postMetaCollector)
        .then(function(inArgs){
            
            var thisTmp = inArgs[1];
            _this.config.popularPosts.tmp.gaData = null;
            _this.config.popularPosts.tmp.gaData = thisTmp;
            
            return new Promise(function(resolve , reject){
                resolve(inArgs[0]);
        });
    });
};


function postMetaCollector(inArgs){
    
    var _this              = inArgs[0];
    var post               = inArgs[1];
    var keywords           = inArgs[2];
    var wordsLength        = inArgs[3];
    var isUpdatePermission = inArgs[4];
    
    var description   = null;
    var eyeCatchImage = null;
    
    return new Promise(function (resolve , reject){
        
        if(post.published && isUpdatePermission){
        
            // get description
            if(post.description && post.description != ""){
                description = post.description;
            }else if(post.excerpt && post.excerpt != ""){
                description = post.excerpt;
            }
            
            // get eyecatch image
            if(post.eyeCatchImage || post.postImage){
                eyeCatchImage = post.eyeCatchImage  || post.postImage;
            }else{
                var imgMatch = post.content.match(/\ssrc\=\"(.+?[\.jpg|\.jpeg|\.png|\.gif])\"/);
                if(imgMatch && imgMatch.length > 2)eyeCatchImage = imgMatch[1];
            }
            
            var isMatched = false;
            
            for(var i=0; i<_this.config.popularPosts.tmp.gaData.length; i++){
                if( _this.config.popularPosts.tmp.gaData[i].path == post.path ){
                    var gaData_tmp = _this.config.popularPosts.tmp.gaData;
                    
                    gaData_tmp[i].updated        = String(post.updated._i);
                    gaData_tmp[i].path           = post.path;
                    gaData_tmp[i].title          = post.title;
                    gaData_tmp[i].eyeCatchImage  = eyeCatchImage;
                    gaData_tmp[i].excerpt        = description;
                    gaData_tmp[i].date           = post.date;
                    gaData_tmp[i].keywords       = keywords;
                    gaData_tmp[i].keywordsLength = wordsLength;
                    
                    _this.config.popularPosts.tmp.gaData = null;
                    _this.config.popularPosts.tmp.gaData = gaData_tmp;
                    isMatched = true;
                }
            }
            
            if(!isMatched){
                var gaData_tmp = _this.config.popularPosts.tmp.gaData;
                gaData_tmp.push( util.gaDataModel({
                    "updated"       : String(post.updated._i),
                    "title"         : post.title ,
                    "path"          : post.path ,
                    "eyeCatchImage" : eyeCatchImage ,
                    "excerpt"       : description ,
                    "date"          : post.date ,
                    "pv"            : 0,
                    "keywords"      : keywords,
                    "keywordsLength": wordsLength
                }) );
                
                // if(keywords.length > 0)console.log(keywords);
                
                _this.config.popularPosts.tmp.gaData = null;
                _this.config.popularPosts.tmp.gaData = gaData_tmp;
            }
        }
        
        resolve( [ post , _this.config.popularPosts.tmp.gaData ]);
    });
}


function morphologicalAnalysis(inArgs){
    
    var _this              = inArgs[0];
    var post               = inArgs[1];
    var isUpdatePermission = inArgs[2];
    
    return new Promise(function(resolve, reject){
        if( post.published){
            if( isUpdatePermission || _this.config.popularPosts.tmp.isNgwUpdate ){
                ma.getKeyword(_this.config, post, function(err, keyword_results , wordsLength ){
                    if(keyword_results && keyword_results.length > 0){
                        
                        // debug keywords
                        if(_this.config.popularPosts.tmp.isLog){
                            console.log("\u001b[32m [hexo-related-popular-posts] Keywords Updated : " + post.path +"\u001b[0m");
                            console.log("  " + wordsLength + " keywords found.");
                            for(var i=0; i<keyword_results.length && i<10; i++ ){
                                console.log( "  -> (" + keyword_results[i].f + ") : "  +keyword_results[i].w);
                            }
                        }
                        
                    }
                    resolve([_this , post , keyword_results , wordsLength ,isUpdatePermission ]);
                });
            }else{
                resolve([_this , post , [] , 0 , isUpdatePermission  ]);
            }
        }else{
            resolve([_this , post , [] , 0 , isUpdatePermission ]);
        }
    });
}

function checkUpdate(inThis , inPost){
    var _this  = inThis;
    var post   = inPost;
    var gaData = _this.config.popularPosts.tmp.gaData;
    
    return new Promise(function(resolve, reject){
        
        var isUpdatePermission = true;
        if(post.published){
            for(var i=0; i < gaData.length; i++){
                if(gaData[i].path == post.path){
                    if( gaData[i].updated == String(post.updated._i)){
                        isUpdatePermission = false;
                    }
                    break;
                }
            }
            
            _this.config.popularPosts.tmp.postPath.push(post.path);
            
        }else{
            isUpdatePermission = false;
        }
        
        resolve([_this , post , isUpdatePermission ]);
    });
}