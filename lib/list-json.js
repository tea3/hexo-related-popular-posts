'use strict';

module.exports.getList = function(options , inThis) {
    
    var assign       = require('object-assign');
    var moment       = require('moment');
    var retrunJson   = [];
    var relatedPosts = [];
    var popularPosts = [];
    var relatedCnt   = 0;
    var popularCnt   = 0;
    var i=0;
    var config       = inThis.config;
    var _this        = inThis;
    
    if (!options)options = {};
    options = assign({
        maxCount: 5,
        ulClass: 'popular-posts',
        PPMixingRate: 0.0,
        isDate: false,
        isImage: false,
        isExcerpt: false
    }, options);

    if(Number(options.PPMixingRate) <= 1.0 && Number(options.maxCount) > 0){
        relatedCnt =  Math.floor( Number(options.maxCount) * ( 1 - Number(options.PPMixingRate) ) );
    }else{
        console.log("\u001b[31m[hexo-related-popular-posts] (Option Error) Please correctly set the value of an option. Please check _config.yml . \u001b[0m ");
        relatedCnt       = 0;
        return "";
    }

    //-------------------------------------------
    // popular posts
    //-------------------------------------------
    // console.log(_this.config.popularPosts.tmp.gaData);
    if(!_this.config.popularPosts.tmp.isGaDataOpt){
        //最適化
        var gaData_opt = [];
        var isOrverlapping;
        for(i=0; i<_this.config.popularPosts.tmp.gaData.length; i++){
            if(_this.config.popularPosts.tmp.gaData[i].date != ""){
                isOrverlapping = false;
                for(var k=0; k<gaData_opt.length; k++){
                    if(gaData_opt[k].title == _this.config.popularPosts.tmp.gaData[i].title){
                        gaData_opt[k].pv += _this.config.popularPosts.tmp.gaData[i].pv;
                        isOrverlapping = true;
                        break;
                    }
                }
                if(!isOrverlapping){
                    gaData_opt.push(_this.config.popularPosts.tmp.gaData[i]);
                }
            }
        }
        
        gaData_opt.sort(function (a,b){
            return (b.pv - a.pv);
        });
        
        _this.config.popularPosts.tmp.gaData = null;
        _this.config.popularPosts.tmp.gaData = gaData_opt;
        _this.config.popularPosts.tmp.isGaDataOpt = true;
        // console.log(_this.config.popularPosts.tmp.gaData);
        popularPosts = gaData_opt;
    }else{
        popularPosts = _this.config.popularPosts.tmp.gaData;
    }



    // //-------------------------------------------
    // // (debug) popular posts
    // //-------------------------------------------
    // console.log("\n\n--- popularPosts ("+ popularPosts.length +") ---");
    // // console.log(popularPosts);
    // for(i=0; i<popularPosts.length; i++){
    //     console.log(" -> "+i +" : "+ popularPosts[i].title + " (" + popularPosts[i].pv + " pv)");
    // }
    
    
    
    

    //-------------------------------------------
    // Related posts
    //-------------------------------------------
    if(_this.post.tags && _this.post.tags.length > 0){
        _this.post.tags.each(function(tag){
            // console.log("--> " + tag.name);
            tag.posts.each(function(post){
                
                var description   = null;
                var eyeCatchImage = null;
                
                // get description
                if(post.description && post.description != ""){
                    description = post.description;
                }else if(post.excerpt && post.excerpt != ""){
                    description = post.excerpt;
                }
                
                // get eyecatch image
                if(post.eyeCatchImage){
                    eyeCatchImage = post.eyeCatchImage;
                }else{
                    var imgMatch = post.content.match(/\ssrc\=\"(.+?[\.jpg|\.jpeg|\.png|\.gif])\"/);
                    if(imgMatch && imgMatch.length > 2)eyeCatchImage = imgMatch[1];
                }
                
                if(post.published){
                    var isExistPost = false;
                    for(i=0; i<relatedPosts.length; i++){
                        if(relatedPosts[i].path == post.path){
                            relatedPosts[i].relatedDegree++;
                            isExistPost = true;
                            break;
                        }
                    }
                    if(!isExistPost && _this.post.path != post.path){
                        var pv = 0;
                        if(popularPosts.length > 0){
                            for(var m=0; m<popularPosts.length; m++){
                                if(popularPosts[m].path == post.path){
                                    pv = popularPosts[m].pv;
                                    break;
                                }
                            }
                        }
                        relatedPosts.push({
                            "title"        : post.title ,
                            "path"         : post.path ,
                            "eyeCatchImage": eyeCatchImage ,
                            "excerpt"      : description , 
                            "date"         : post.date ,
                            "pv"           : pv ,
                            "relatedDegree": 1
                        });
                    }
                }
            });
        });
    }

    // sort by relatedDegree & pv
    relatedPosts.sort(function (a,b){
        if(b.relatedDegree == a.relatedDegree){
            return (b.pv - a.pv);
        }else{
            return (b.relatedDegree - a.relatedDegree);
        }
    });



    // //-------------------------------------------
    // // (debug) Related posts
    // //-------------------------------------------
    // console.log("\n\n--- relatedPosts ("+ relatedPosts.length +") ---");
    // // console.log(relatedPosts);
    // for(i=0; i<relatedPosts.length; i++){
    //     console.log(" -> "+i +" : "+relatedPosts[i].title + " (" + relatedPosts[i].relatedDegree + " pt & "+ relatedPosts[i].pv +" pv)");
    // }
    
    
    //-------------------------------------------
    // Generated posts
    //-------------------------------------------
    // retrunJson
    var addedPath = [];
    function getElm(list){
        if(addedPath.indexOf(list.path) != -1 )return null;
        addedPath.push(list.path);
        
        var ret = {
                date   : "",
                img    : "",
                title  : "",
                path   : "",
                excerpt: ""
        };
        
        
        if(options.isDate && list.date != ""){
            ret.date =  moment(list.date._i).format(config.date_format || "YYYY-MM-DD");
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
    for(i=0; i<relatedCnt; i++){
        if(i<relatedPosts.length){
            var elm = getElm(relatedPosts[i]);
            if(elm)retrunJson.push( elm );
        }else{
            break;
        }
    }
    
    // mixing popular posts
    var popularCnt = Number(options.maxCount) - relatedCnt;
    i=0;
    while(addedPath.length < Number(options.maxCount) && popularCnt > 0 && i<popularPosts.length){
        var elm = getElm(popularPosts[i]);
        if(elm){
            retrunJson.push( elm );
            popularCnt--;
        }
        i++;
    }

  return { "json":retrunJson , "class":options.ulClass };
}