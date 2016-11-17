'use strict';

module.exports = function(options) {
    var pv = getPV(options , this);
  return pv;
}

function getPV(options , inThis){
    var config = inThis.config;
    var _this  = inThis;
    var pv     = 0;
    
    if(_this.post != undefined){
        for(var i = 0; i < _this.config.popularPosts.tmp.gaData.length; i++){
            if(_this.config.popularPosts.tmp.gaData[i].path == _this.post.path){
                if(_this.config.popularPosts.tmp.pvMeasurementsStartDate != ""){
                    pv = _this.config.popularPosts.tmp.gaData[i].totalPV;
                }else{
                    pv = _this.config.popularPosts.tmp.gaData[i].pv;
                }
                break;
            }
        }
    }
    
    return pv;
}