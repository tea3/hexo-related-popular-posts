'use strict';

module.exports = function() {
    
    var mkdirp     = require('mkdirp');
    var pathFn     = require('path');
    var fs         = require('hexo-fs');
    var cm         = require('columnify');
    var lg         = require('./log.js');
    var su         = require('./settingsUpdate.js');
    
    var gaData_removedDeadLink  = [];
    var cacheData               = "";
    var cache_path              = this.config.popularPosts.tmp.cache_path;
    var rankingSheet            = this.config.popularPosts.tmp.rankingSheet;
    var pvMeasurementsStartDate = this.config.popularPosts.tmp.pvMeasurementsStartDate;
    var isGaUpdate              = this.config.popularPosts.tmp.isGaUpdate;
    var gaData                  = this.config.popularPosts.tmp.gaData;
    var ndt                     = new Date();
    ndt                         = ndt.getTime();
    
    lg.setConfig(this.config);
    
    // remove dead link & private page
    for(var i = 0; i < gaData.length; i++){
        for(var k = 0; k < this.config.popularPosts.tmp.postPath.length; k++){
            if(this.config.popularPosts.tmp.postPath[k] == gaData[i].path){
                gaData_removedDeadLink.push(gaData[i]);
            }
        }
    }
    
    
    // writing page view ranking sheet
    if(isGaUpdate && rankingSheet){
        var cmData               = [];
        var cmData_sortByPV      = [];
        var cmData_sortByTotalPV = [];
        
        for(var i=0; i < gaData_removedDeadLink.length; i++){
            cmData.push({
                "PV"       :Number(gaData_removedDeadLink[i].pv),
                "TotalPV"  :Number(gaData_removedDeadLink[i].totalPV),
                "Permalink":gaData_removedDeadLink[i].path,
                "Title"    :gaData_removedDeadLink[i].title
            });
        }
        
        cmData.sort(function (a,b){
            if(b.PV != a.PV){
                return (b.PV - a.PV);
            }else{
                return (b.TotalPV - a.TotalPV);
            }
        });
        cmData_sortByPV = [].concat(cmData);
        
        if(pvMeasurementsStartDate != ""){
            cmData.sort(function (a,b){
                if(b.TotalPV != a.TotalPV){
                    return (b.TotalPV - a.TotalPV);
                }else{
                    return (b.PV - a.PV);
                }
            });
            cmData_sortByTotalPV = [].concat(cmData);
        }
        
        var sortByPV_Str = cmData_sortByPV.length > 0 ? "Pageview Ranking\n\n" + cm(cmData_sortByPV) : "";
        var sortByPV_TotalStr = cmData_sortByTotalPV.length > 0 ? "\n\n\n\nPageview Ranking (Total)\n\n" + cm(cmData_sortByTotalPV) : "";
        
        mkdirp.sync( pathFn.dirname( rankingSheet ));
        fs.writeFileSync( rankingSheet , sortByPV_Str + sortByPV_TotalStr );
        
        lg.log("info", "updated rankingSheet file." , null , false);
        
        cmData               = null;
        cmData_sortByPV      = null;
        cmData_sortByTotalPV = null;
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