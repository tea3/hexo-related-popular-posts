'use strict';

module.exports = function(post) {

    //-------------------------------------------
    // popular posts data (Page View)
    //-------------------------------------------

    if(this.config.popularPosts.tmp.gaData.length > 0){
        
        var relatedPosts  = [];
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
            for(var i=0; i<this.config.popularPosts.tmp.gaData.length; i++){
                if(this.config.popularPosts.tmp.gaData[i].path.replace(/\/amp\//,"/").replace(/\/index\.html/,"/").replace(/\?.+/,"") == "/" + post.path){
                    var gaData_tmp = this.config.popularPosts.tmp.gaData;
                    
                    gaData_tmp[i].path          = post.path;
                    gaData_tmp[i].title         = post.title;
                    gaData_tmp[i].eyeCatchImage = eyeCatchImage;
                    gaData_tmp[i].excerpt       = description;
                    gaData_tmp[i].date          = post.date;
                    
                    this.config.popularPosts.tmp.gaData = null;
                    this.config.popularPosts.tmp.gaData = gaData_tmp;
                }
            }
        }
        
        
    }else{
        if(!this.config.popularPosts.tmp.isAlert && this.config.popularPosts.tmp.id){
            console.log("\u001b[33m[hexo-related-popular-posts] (warning) " + this.config.popularPosts.tmp.cache_path + " is not yet been created. Please wait & retry. \u001b[0m");
            this.config.popularPosts.tmp.isAlert = true;
        }
    }
    
    
  return post;
}