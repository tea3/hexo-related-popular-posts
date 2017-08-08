'use strict';

module.exports.getList = function(options , inThis , inHexo , inForcePost) {
    
    var assign       = require('object-assign');
    var moment       = require('moment');
    var pathFn       = require('path');
    var lg           = require('./log.js');
    var retrunJson   = [];
    var relatedPosts = [];
    var popularPosts = [];
    var relatedCnt   = 0;
    var popularCnt   = 0;
    var postsCat     = "";
    var weight_of_tag_relevancy;
    var weight_of_contents_relevancy;
    var i = 0;
    var k = 0;
    var m = 0;
    var n = 0;
    var q = 0;
    var config       = inThis.config;
    var _this        = inThis;
    var postData     = ( _this.post ? _this.post : inForcePost);
    
    
    // load hexo@3.2's cache
    //--------------------------------------------
    if(!_this.config.popularPosts.tmp.cache_path && inHexo && inHexo.locals && inHexo.locals.cache && inHexo.locals.cache.posts.length && inHexo.locals.cache.posts.data[0].popularPost_tmp_gaData){
        var tmp_gaData = _this.config.popularPosts.tmp.gaData;
        _this.config.popularPosts.tmp.postPath = null;
        _this.config.popularPosts.tmp.postPath = [];
        _this.config.popularPosts.tmp.gaData   = null;
        _this.config.popularPosts.tmp.gaData   = [];
        for(var v = 0; v < inHexo.locals.cache.posts.length; v++){
            
            // PV update
            if(_this.config.popularPosts.tmp.isGaUpdate){
                for(var w=0; w<tmp_gaData.length; w++){
                    if(inHexo.locals.cache.posts.data[v].popularPost_tmp_gaData.path == tmp_gaData[w].path){
                        inHexo.locals.cache.posts.data[v].popularPost_tmp_gaData.pv = tmp_gaData[w].pv;
                        inHexo.locals.cache.posts.data[v].popularPost_tmp_gaData.totalPV = tmp_gaData[w].totalPV;
                        break;
                    }
                }
            }
            
            _this.config.popularPosts.tmp.gaData.push(inHexo.locals.cache.posts.data[v].popularPost_tmp_gaData);
            if(inHexo.locals.cache.posts.data[v].popularPost_tmp_postPath)_this.config.popularPosts.tmp.postPath.push(inHexo.locals.cache.posts.data[v].path);
        }
        tmp_gaData = null;
    }
    //--------------------------------------------
    
    
    lg.setConfig(_this.config);
    
    
    if (!options)options = {};
    options = assign({
        maxCount      : 5,
        ulClass       : 'popular-posts',
        PPMixingRate  : 0.0,
        isDate        : false,
        isImage       : false,
        isExcerpt     : false,
        PPCategoryFilter: "" ,
    }, options);
    
    if(Number(options.PPMixingRate) <= 1.0 && Number(options.maxCount) > 0){
        relatedCnt =  Math.floor( Number(options.maxCount) * ( 1 - Number(options.PPMixingRate) ) );
    }else{
        lg.log("error", "(Option Error) Please correctly set the option value of helper tag. " , null , true);
        relatedCnt = 0;
        return "";
    }

    if(options.PPCategoryFilter && options.PPCategoryFilter != ""){
        postsCat = options.PPCategoryFilter;
    }

    weight_of_tag_relevancy = _this.config.popularPosts.tmp.weight_of_tag_relevancy;
    weight_of_contents_relevancy = _this.config.popularPosts.tmp.weight_of_contents_relevancy;


    //-------------------------------------------
    // popular posts
    //-------------------------------------------
    if( Number(options.PPMixingRate) != 0 ){
        var gaData_opt = [];
        var isOrverlapping;
        
        if(postData != undefined && postsCat == ""){
            for(i = 0; i < _this.config.popularPosts.tmp.gaData.length; i++){
                if(_this.config.popularPosts.tmp.gaData[i].path == _this.post.path){
                    postsCat = _this.config.popularPosts.tmp.gaData[i].categories;
                    break;
                }
            }
        }
        
        for( i = 0; i < _this.config.popularPosts.tmp.gaData.length; i++){
            if(_this.config.popularPosts.tmp.gaData[i].date != ""){
                if(postsCat == "" || _this.config.popularPosts.tmp.gaData[i].categories == postsCat)gaData_opt.push(_this.config.popularPosts.tmp.gaData[i]);
            }
        }
        
        gaData_opt.sort(function (a,b){
            return (b.pv - a.pv);
        });
        popularPosts = gaData_opt;
    }


    // //-------------------------------------------
    // // (debug) popular posts
    // //-------------------------------------------
    // console.log("\n\n--- popularPosts ("+ popularPosts.length +") ---");
    // // console.log(popularPosts);
    // for(i=0; i<popularPosts.length; i++){
    //     console.log(" -> "+i +" : "+ popularPosts[i].title + " (" + popularPosts[i].pv + " pv)");
    // }
    
    
    if( Number(options.PPMixingRate) != 1.0 ){
        //-------------------------------------------
        // Related posts (tag)
        //-------------------------------------------
        if(postData.tags && postData.tags.length > 0){
            postData.tags.each(function(tag){
                tag.posts.each(function(post){
                    
                    var description   = null;
                    var eyeCatchImage = null;
                    var post_title    = null;
                    var post_date     = null;
                    var post_path     = null;
                    
                    for(i = 0; i < _this.config.popularPosts.tmp.gaData.length; i++){
                        if(_this.config.popularPosts.tmp.gaData[i] && _this.config.popularPosts.tmp.gaData[i].path == post.path){
                            description   = _this.config.popularPosts.tmp.gaData[i].excerpt;
                            eyeCatchImage = _this.config.popularPosts.tmp.gaData[i].eyeCatchImage;
                            post_path     = _this.config.popularPosts.tmp.gaData[i].path;
                            post_date     = _this.config.popularPosts.tmp.gaData[i].date;
                            post_title    = _this.config.popularPosts.tmp.gaData[i].title;
                            break;
                        }
                    }
                    
                    if(post.published){
                        var isExistPost = false;
                        for( i = 0; i < relatedPosts.length; i++){
                            if(relatedPosts[i].path == post.path){
                                relatedPosts[i].relatedDegree++;
                                isExistPost = true;
                                break;
                            }
                        }
                        if(!isExistPost && postData.path != post.path){
                            var pv = 0;
                            if(popularPosts.length > 0){
                                for( m = 0; m < popularPosts.length; m++){
                                    if(popularPosts[m].path == post.path){
                                        pv = popularPosts[m].pv;
                                        break;
                                    }
                                }
                            }
                            relatedPosts.push({
                                "title"           : post_title ,
                                "path"            : post_path ,
                                "eyeCatchImage"   : eyeCatchImage ,
                                "excerpt"         : description , 
                                "date"            : post_date ,
                                "pv"              : pv ,
                                "relatedDegree"   : 1 ,
                                "relatedDegree_ma": 0 , 
                                "matchKeyWord"    : matchKeyWord
                            });
                        }
                    }
                });
            });
        }







        //-------------------------------------------
        // Related posts ( Contents morphological analysis )
        //-------------------------------------------
        if(_this.config.popularPosts.morphologicalAnalysis && _this.config.popularPosts.tmp.gaData){
            
            var postsGaData;
            
            for( i = 0; i < _this.config.popularPosts.tmp.gaData.length; i++){
                if(_this.config.popularPosts.tmp.gaData[i].path == postData.path){
                    postsGaData = _this.config.popularPosts.tmp.gaData[i];
                    break;
                }
            }
            
            if(postsGaData){
                for( i = 0; i < _this.config.popularPosts.tmp.gaData.length; i++){
                    var matchScore   = 0;
                    var matchKeyWord = [];
                    if(_this.config.popularPosts.tmp.gaData[i].path != postData.path){
                        
                        // Relevance of content's keywords
                        for(k = 0; k < postsGaData.keywords.length; k++){
                            for(n = 0; n < _this.config.popularPosts.tmp.gaData[i].keywords.length; n++){
                                if(postsGaData.keywords[k].w == _this.config.popularPosts.tmp.gaData[i].keywords[n].w && postsGaData.categories == _this.config.popularPosts.tmp.gaData[i].categories ){
                                    matchScore += Number(postsGaData.keywords[k].f) / (Number(postsGaData.keywordsLength) || 500 )  + Number(_this.config.popularPosts.tmp.gaData[i].keywords[n].f) / (Number(_this.config.popularPosts.tmp.gaData[i].keywordsLength) || 500);
                                    
                                    matchKeyWord.push({"w":_this.config.popularPosts.tmp.gaData[i].keywords[n].w , "f":_this.config.popularPosts.tmp.gaData[i].keywords[n].f});
                                }
                            }
                        }
                        
                        // Relevance of internal link
                        for(k = 0; k < postsGaData.internalLinks.length; k++){
                            if(pathFn.normalize(postsGaData.internalLinks[k]) == pathFn.normalize(_this.config.popularPosts.tmp.gaData[i].path)){
                                matchScore += 5.0;
                            }
                        }
                    }
                    
                    if(matchScore > 0){
                        
                        var isAleadyCreatedList = false;
                        for( q = 0; q < relatedPosts.length; q++){
                            if(relatedPosts[q].path == _this.config.popularPosts.tmp.gaData[i].path){
                                relatedPosts[q].relatedDegree_ma = matchScore;
                                relatedPosts[q].matchKeyWord     = matchKeyWord;
                                isAleadyCreatedList              = true;
                                break;
                            }
                        }
                        
                        if( !isAleadyCreatedList ){
                            relatedPosts.push({
                                "title"           : _this.config.popularPosts.tmp.gaData[i].title ,
                                "path"            : _this.config.popularPosts.tmp.gaData[i].path ,
                                "eyeCatchImage"   : _this.config.popularPosts.tmp.gaData[i].eyeCatchImage ,
                                "excerpt"         : _this.config.popularPosts.tmp.gaData[i].excerpt , 
                                "date"            : _this.config.popularPosts.tmp.gaData[i].date ,
                                "pv"              : _this.config.popularPosts.tmp.gaData[i].pv ,
                                "relatedDegree"   : 0 ,
                                "relatedDegree_ma": matchScore ,
                                "matchKeyWord"    : matchKeyWord
                            });
                        }
                    }
                }
            }
        }

        // sort by relatedDegree & pv
        relatedPosts.sort(function (a,b){
            
            var degreeA = a.relatedDegree * weight_of_tag_relevancy + a.relatedDegree_ma * weight_of_contents_relevancy;
            var degreeB = b.relatedDegree * weight_of_tag_relevancy + b.relatedDegree_ma * weight_of_contents_relevancy;
            
            if(degreeB == degreeA){
                return (b.pv - a.pv);
            }else{
                return (degreeB - degreeA);
            }
        });
    }


    //-------------------------------------------
    // (debug) Related posts
    //-------------------------------------------
    // console.log("\n\n--- relatedPosts ("+ relatedPosts.length +") ---");
    // if(relatedPosts && relatedPosts.length > 0){
    //     for(i=0; i<relatedPosts.length; i++){
    //         console.log("\n-> "+i);
    //         console.log("  title: " + relatedPosts[i].title);
    //         console.log("  path: " + relatedPosts[i].path);
    //         console.log("  score: " + relatedPosts[i].relatedDegree + " pt & " + relatedPosts[i].relatedDegree_ma + " pt & " + relatedPosts[i].pv +" pv");
    //         // if(relatedPosts[i].matchKeyWord)console.log("  keywords: ");
    //         // if(relatedPosts[i].matchKeyWord)console.log(relatedPosts[i].matchKeyWord);
    //     }
    // }
    
    
    
    //-------------------------------------------
    // checked lists
    //-------------------------------------------
    var isWarning = false
    for( i = 0; i < popularPosts.length; i++ ){
        if(popularPosts[i] == null || popularPosts[i] == undefined){
            isWarning = true;
            break;
        }
    }
    for( i = 0; i < relatedPosts.length; i++ ){
        if(relatedPosts[i] == null || relatedPosts[i] == undefined){
            isWarning = true;
            break;
        }
    }
    if(isWarning)lg.log("error", "Because the post's path has been changed, the link can not be created successfully. Please remove the cache with the following command.\r\n$ hexo clean" + _this.config.popularPosts.tmp.cache_path ? ("\r\n$ rm -f "+_this.config.popularPosts.tmp.cache_path) : "" , null , false);
    
    
    //-------------------------------------------
    // Generated posts
    //-------------------------------------------
    // retrunJson
    var addedPath = [];
    function getElm(list){
        if( addedPath.indexOf( list.path ) != -1 ) return null;
        addedPath.push( list.path );
        
        var ret = {
            date   : "",
            img    : "",
            title  : "",
            path   : "",
            excerpt: ""
        };
        
        
        if(options.isDate && list.date != ""){
            ret.date =  moment(list.date).format(config.date_format || "YYYY-MM-DD");
        }
        
        if(options.isImage && list.eyeCatchImage != ""){
            ret.img = list.eyeCatchImage;
        }
        ret.title = list.title;
        ret.path  = "/"+list.path;
        if(options.isExcerpt && list.excerpt != ""){
            ret.excerpt = list.excerpt;
        }
        
        return ret;
    }
    
    
    // mixing related posts
    for( i = 0; i < relatedCnt; i++){
        if( i < relatedPosts.length){
            var elm = getElm(relatedPosts[i]);
            if( elm ) retrunJson.push( elm );
        }else{
            break;
        }
    }
    
    // mixing popular posts
    var popularCnt = Number(options.maxCount) - relatedCnt;
    i = 0;
    while( addedPath.length < Number(options.maxCount) && popularCnt > 0 && i < popularPosts.length ){
        var elm = getElm( popularPosts[i] );
        if( elm ){
            retrunJson.push( elm );
            popularCnt--;
        }
        i++;
    }
  return { "json":retrunJson , "class":options.ulClass };
}