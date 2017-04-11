'use strict';

var Promise     = require('bluebird');
var gaAnalytics = require('ga-analytics');
var dr          = require('./dateRange.js');
var util        = require('./util.js');
var lg          = require('./log.js');

var ndt = new Date();
    ndt = ndt.getTime();

module.exports = function() {
    var _this = this;
    
    lg.setConfig(_this.config);
    
    return getPVfromGA(this)
        .then(getTotalPVfromGA)
        .then(function(inArgs){
            
            if(inArgs[1]) lg.log("info", "Google Analytics Page View Data was refreshed." , null , false);
            
            return new Promise(function(resolve , reject){
                resolve(inArgs[0]);
        });
    });
};




function getTotalPVfromGA(inArgs){
    var _this     = inArgs[0];
    var isUpdated = inArgs[1];
    
    return new Promise(function(resolve, reject){
        
        // load google analytics data
        if(_this.config.popularPosts.tmp.isGaUpdate){
            if(_this.config.popularPosts.tmp.id && _this.config.popularPosts.tmp.email && _this.config.popularPosts.tmp.key && _this.config.popularPosts.tmp.viewId && _this.config.popularPosts.tmp.pvMeasurementsStartDate != ""){
                gaAnalytics({
                    dimensions  : 'ga:pagePath' , 
                    metrics     : 'ga:pageviews' , 
                    clientId    : _this.config.popularPosts.tmp.id , 
                    serviceEmail: _this.config.popularPosts.tmp.email , 
                    key         : _this.config.popularPosts.tmp.key , 
                    ids         : _this.config.popularPosts.tmp.viewId , 
                    startDate   : _this.config.popularPosts.tmp.pvMeasurementsStartDate , 
                    endDate     : dr.getYesterdayDateStr() ,
                    sort        : '-ga:pageviews'
                }, function (err, res) {
                    if (err) {
                        lg.log("error", "(ga-analytics totalPV error) " + err + "\nPlease check the Google AnalyticsAPI Options or Environment Variables." , "_config.yml" , true );
                        resolve([_this]);
                    } else {
                        if( res.rows && res.rows.length > 0){
                            for( var i = 0; i < res.rows.length; i++){
                                for(var k = 0; k < _this.config.popularPosts.tmp.gaData.length; k++){
                                    if( _this.config.popularPosts.tmp.gaData[k].path == util.normalizeURL(res.rows[i][0]) ){
                                        
                                        _this.config.popularPosts.tmp.gaData[k].totalPV = _this.config.popularPosts.tmp.gaData[k].totalPV + Number(res.rows[i][1]);
                                        break;
                                    }
                                }
                            }
                        }
                        
                        var gaDataTmp = _this.config.popularPosts.tmp.gaData;
                        
                        util.orverrideTmp(gaDataTmp, _this);
                        
                        resolve([_this , (true || isUpdated ) ]);
                    }
                });
            }else{
                resolve([_this , ( false || isUpdated ) ]);
            }
        }else{
            resolve([_this , ( false || isUpdated )]);
        }
        
    });
}



function getPVfromGA(inThis){
    var _this  = inThis;
    
    return new Promise(function(resolve, reject){
        
        var gaData;
        
        // load google analytics data
        if(_this.config.popularPosts.tmp.isGaUpdate){
            if(_this.config.popularPosts.tmp.id && _this.config.popularPosts.tmp.email && _this.config.popularPosts.tmp.key && _this.config.popularPosts.tmp.viewId){
                gaAnalytics({
                    dimensions  : 'ga:pagePath' , 
                    metrics     : 'ga:pageviews' , 
                    clientId    : _this.config.popularPosts.tmp.id , 
                    serviceEmail: _this.config.popularPosts.tmp.email , 
                    key         : _this.config.popularPosts.tmp.key , 
                    ids         : _this.config.popularPosts.tmp.viewId , 
                    startDate   : _this.config.popularPosts.tmp.startDate , 
                    endDate     : _this.config.popularPosts.tmp.endDate ,
                    sort        : '-ga:pageviews'
                }, function (err, res) {
                    if (err) {
                        lg.log("error", "(ga-analytics pv error) " + err + "\nPlease check the Google AnalyticsAPI Options or Environment Variables." , "_config.yml" , true );
                        resolve([_this]);
                    } else {
                        gaData = [{ "cachedDate":ndt , "gaData":[] }];
                        if( res.rows && res.rows.length > 0){
                            for( var i = 0; i < res.rows.length; i++){
                                var isAleadyCreated = false;
                                for(var k = 0; k < _this.config.popularPosts.tmp.gaData.length; k++){
                                    if( _this.config.popularPosts.tmp.gaData[k].path == util.normalizeURL(res.rows[i][0]) ){
                                        
                                        gaData[0].gaData.push( util.gaDataModel({
                                            "updated"        : _this.config.popularPosts.tmp.gaData[k].updated || "0" ,
                                            "title"          : _this.config.popularPosts.tmp.gaData[k].title || "" ,
                                            "path"           : res.rows[i][0] ,
                                            "eyeCatchImage"  : _this.config.popularPosts.tmp.gaData[k].eyeCatchImage || "" ,
                                            "excerpt"        : _this.config.popularPosts.tmp.gaData[k].excerpt || "" ,
                                            "date"           : _this.config.popularPosts.tmp.gaData[k].date || "",
                                            "pv"             : Number(res.rows[i][1]) ,
                                            "totalPV"        : 0 ,
                                            "categories": _this.config.popularPosts.tmp.gaData[k].categories || [] ,
                                            "internalLinks"  : _this.config.popularPosts.tmp.gaData[k].internalLinks || [] ,
                                            "keywords"       : _this.config.popularPosts.tmp.gaData[k].keywords || [] ,
                                            "keywordsLength" : _this.config.popularPosts.tmp.gaData[k].keywordsLength || 0
                                        }) );
                                        
                                        isAleadyCreated = true;
                                        break;
                                    }
                                }
                                
                                if(!isAleadyCreated){
                                    
                                    gaData[0].gaData.push( util.gaDataModel({
                                        "path": res.rows[i][0] ,
                                        "pv"  : Number( res.rows[i][1] )
                                    }) );
                                }
                            }
                        }
                        
                        // Adding a page without access.
                        for(var k = 0; k < _this.config.popularPosts.tmp.gaData.length; k++){
                            var isNotMatch = true;
                            if( res.rows && res.rows.length > 0 ){
                                for( var i = 0; i < res.rows.length; i++){
                                    if( _this.config.popularPosts.tmp.gaData[k].path == util.normalizeURL(res.rows[i][0]) ){
                                        isNotMatch = false;
                                    }
                                }
                            }
                            if(isNotMatch){
                                gaData[0].gaData.push( _this.config.popularPosts.tmp.gaData[k] );
                            }
                        }
                        
                        // normalized URL
                        var gaData_temp = util.normalizeGaData( gaData[0].gaData );
                        gaData[0].gaData = null;
                        gaData[0].gaData = gaData_temp;
                        
                        
                        util.orverrideTmp(gaData[0].gaData, _this);
                        
                        
                        resolve([_this , true]);
                    }
                });
            }else{
                resolve([_this , false]);
            }
        }else{
            resolve([_this , false]);
        }
        
    });
}