'use strict';

var pathFn       = require('path');
var fs           = require('hexo-fs');
var assign       = require('object-assign');
var gaAnalytics  = require('ga-analytics');
var moment       = require('moment');
var util         = require('./lib/util.js');
var dr           = require('./lib/dateRange.js');
var su           = require('./lib/settingsUpdate.js');
var lg           = require('./lib/log.js');
var pjson        = require('./package.json');

var isGARefresh  = false;
var dateRangeArr = null;
var gaData       = null;
var shash        = su.chkUpdate(hexo.config);
var ngwHash      = su.chkUpdate_ngw(hexo.config);
var ndt = new Date();
  	ndt = ndt.getTime();



// option
var dateRange                    = 30;
var id                           = null;
var email                        = null;
var key                          = null;
var viewId                       = null;
var cache_path                   = null;
var cache_exexpires              = 10;
var weight_of_tag_relevancy      = 1.0;
var weight_of_contents_relevancy = 1.0;
var isLog 						 = true;


// get setting from _config.yml
if( hexo.config.popularPosts ){

	if( hexo.config.popularPosts.googleAnalyticsAPI){
		// Deprecated message
		if( hexo.config.popularPosts.googleAnalyticsAPI.cache && ( hexo.config.popularPosts.googleAnalyticsAPI.cache.path != undefined || hexo.config.popularPosts.googleAnalyticsAPI.cache.expiresDate != undefined ) ){
			lg.log("error", "(Deprecated option) 'googleAnalyticsAPI.cache.path' and 'googleAnalyticsAPI.cache.expiresDate' are deprecated. Please set the 'cache.path' and 'googleAnalyticsAPI.expiresDate' option." , "_config.yml" , true);
			return;
		}

		// google analytics option
		if( hexo.config.popularPosts.googleAnalyticsAPI.dateRange){
			dateRange = Number(hexo.config.popularPosts.googleAnalyticsAPI.dateRange);
		}
		dateRangeArr = dr.getDateRange(dateRange);

		if( hexo.config.popularPosts.googleAnalyticsAPI.clientId && hexo.config.popularPosts.googleAnalyticsAPI.serviceEmail && hexo.config.popularPosts.googleAnalyticsAPI.key && hexo.config.popularPosts.googleAnalyticsAPI.viewId){
			id          = hexo.config.popularPosts.googleAnalyticsAPI.clientId;
			email       = hexo.config.popularPosts.googleAnalyticsAPI.serviceEmail;
			key         = pathFn.join(process.env.PWD , hexo.config.popularPosts.googleAnalyticsAPI.key);
			viewId      = 'ga:' + hexo.config.popularPosts.googleAnalyticsAPI.viewId;
		}else if( process.env.GOOGLEAPI_CLIENTID && process.env.GOOGLEAPI_EMAIL && process.env.GOOGLEAPI_KEY && process.env.GOOGLEAPI_ANALYTICS_TABLE ){
			id          = process.env.GOOGLEAPI_CLIENTID;
			email       = process.env.GOOGLEAPI_EMAIL;
			key         = process.env.GOOGLEAPI_KEY;
			viewId      = process.env.GOOGLEAPI_ANALYTICS_TABLE;
		}else{
			lg.log("error", "Please set the googleAnalyticsAPI options or environment variables." , "_config.yml" , true);
			return;
		}

		if( hexo.config.popularPosts.googleAnalyticsAPI.expiresDate != undefined){
			cache_exexpires = Number(hexo.config.popularPosts.googleAnalyticsAPI.expiresDate);
		}
	}

	// related posts weight option
	if( hexo.config.popularPosts.weight ){
		if( hexo.config.popularPosts.weight.tagRelevancy != undefined){
			weight_of_tag_relevancy = Number(hexo.config.popularPosts.weight.tagRelevancy);
		}
		if( hexo.config.popularPosts.weight.contentsRelevancy != undefined){
			weight_of_contents_relevancy = Number(hexo.config.popularPosts.weight.contentsRelevancy);
		}
	}
	
	// cache option
	if( hexo.config.popularPosts.cache && hexo.config.popularPosts.cache.path){
		cache_path = pathFn.join(process.env.PWD , hexo.config.popularPosts.cache.path);
	}
	
	// log option
	if( hexo.config.popularPosts.log != undefined){
		isLog = hexo.config.popularPosts.log;
	}
}


// orverride config.popularPosts
hexo.config.popularPosts = assign( {}, 
	hexo.config.popularPosts, {
		"tmp" : {
			"isLog"                       : isLog , 
			"negativewordsUpdate"         : ngwHash ,
			"cacheUpdate"                 : "" ,
			"isNgwUpdate"                 : true , 
			"settingsUpdate"              : shash ,
			"version" 					  : pjson.version,
			"dateRange"                   : dateRange,
			"id"                          : id,
			"email"                       : email,
			"key"                         : key,
			"viewId"                      : viewId,
			"cache_path"                  : cache_path,
			"cache_exexpires"             : cache_exexpires,
			"old_cacheDate"               : "" ,
			"weight_of_tag_relevancy"     : weight_of_tag_relevancy,
			"weight_of_contents_relevancy": weight_of_contents_relevancy,
			"startDate"                   : dateRangeArr[0],
			"endDate"                     : dateRangeArr[1],
			"gaData"                      : [] , 
			"postPath"					  : []
		}
	}
);

lg.setConfig(hexo.config);

// orverride config.popularPosts.tmp data
function orverrideTmp(inGaData){
	hexo.config.popularPosts.tmp = assign( {}, 
		hexo.config.popularPosts.tmp , {
			"gaData" : inGaData
		}
	);
	
	// console.log("-- (debug) hexo.config.popularPosts.tmp.gaData ---");
	// for(var i=0; i<hexo.config.popularPosts.tmp.gaData.length; i++){
	// 	console.log("tmp : " + hexo.config.popularPosts.tmp.gaData[i].path);
	// }
}


// load cache data
if(cache_path && fs.existsSync(cache_path)){
	var gaDataStr = fs.readFileSync(cache_path);
  	gaData = JSON.parse(gaDataStr);
  	hexo.config.popularPosts.tmp.cacheUpdate = su.getMD5(gaDataStr);
  	
  	// check update of morphologicalAnalysis's negativeKeywordsList
  	var isNgwUpdate = !gaData[0].ngwHash || gaData[0].ngwHash != ngwHash;
  	hexo.config.popularPosts.tmp.isNgwUpdate = isNgwUpdate;
  	
  	// check the cache format version and hash data
  	if(gaData[0].version && gaData[0].version == pjson.version && gaData[0].hash && gaData[0].hash == shash){
  		if(gaData[0].cachedDate &&  (ndt - gaData[0].cachedDate) < cache_exexpires*24*60*60*1000 ){
			isGARefresh = true;
		}
		hexo.config.popularPosts.tmp.old_cacheDate = gaData[0].cachedDate;
  	}else{
  		gaData = null;
  	}
  	
	if(gaData){
		orverrideTmp(gaData[0].gaData);
	}else{
		orverrideTmp([]);
	}
}

// load google analytics data
if(!isGARefresh){
	if(id && email && key && viewId){
		gaAnalytics({
		    dimensions  : 'ga:pagePath' , 
		    metrics     : 'ga:pageviews' , 
		    clientId    : id , 
		    serviceEmail: email , 
		    key         : key , 
		    ids         : viewId , 
		    startDate   : dateRangeArr[0] , 
		    endDate     : dateRangeArr[1] ,
		    sort        : '-ga:pageviews'
		}, function (err, res) {
		    if (err) {
		    	lg.log("error", "(ga-analytics error) " + err + "\nPlease check the googleAnalyticsAPI options or environment variables." , "_config.yml" , true );
		    	return;
		    } else {
		        gaData = [{ "cachedDate":ndt , "gaData":[] }];
		        if( res.rows && res.rows.length > 0){
		        	for( var i = 0; i < res.rows.length; i++){
		        		var isAleadyCreated = false;
		        		for(var k = 0; k < hexo.config.popularPosts.tmp.gaData.length; k++){
		        			if( hexo.config.popularPosts.tmp.gaData[k].path == util.normalizeURL(res.rows[i][0]) ){
		        				
		        				gaData[0].gaData.push( util.gaDataModel({
									"updated"        : hexo.config.popularPosts.tmp.gaData[k].updated || "0" ,
									"title"          : hexo.config.popularPosts.tmp.gaData[k].title || "" ,
									"path"           : res.rows[i][0] ,
									"eyeCatchImage"  : hexo.config.popularPosts.tmp.gaData[k].eyeCatchImage || "" ,
									"excerpt"        : hexo.config.popularPosts.tmp.gaData[k].excerpt || "" ,
									"date"           : hexo.config.popularPosts.tmp.gaData[k].date || "",
									"pv"             : Number(res.rows[i][1]) ,
									"post.categories": hexo.config.popularPosts.tmp.gaData[k].post.categories || [] ,
									"internalLinks"  : hexo.config.popularPosts.tmp.gaData[k].internalLinks || [] ,
									"keywords"       : hexo.config.popularPosts.tmp.gaData[k].keywords || [] ,
									"keywordsLength" : hexo.config.popularPosts.tmp.gaData[k].keywordsLength || 0
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
		        for(var k = 0; k < hexo.config.popularPosts.tmp.gaData.length; k++){
		        	var isNotMatch = true;
		        	if( res.rows && res.rows.length > 0 ){
			        	for( var i = 0; i < res.rows.length; i++){
			        		if( hexo.config.popularPosts.tmp.gaData[k].path == util.normalizeURL(res.rows[i][0]) ){
			        			isNotMatch = false;
			        		}
			        	}
		        	}
		        	if(isNotMatch){
		        		gaData[0].gaData.push( hexo.config.popularPosts.tmp.gaData[k] );
		        	}
		        }
		        
		        // normalized URL
		        var gaData_temp = util.normalizeGaData( gaData[0].gaData );
		        gaData[0].gaData = null;
		        gaData[0].gaData = gaData_temp;
		        
		        lg.log("info", "Google Analytics Page View Data was refreshed." , null , false);
		        
		        orverrideTmp(gaData[0].gaData);
		    }
		});
	}
}



hexo.extend.filter.register('after_post_render', require('./lib/collector'), {async: true});
hexo.extend.filter.register('after_generate', require('./lib/cache') );
hexo.extend.helper.register('popular_posts', require('./lib/helper'));
hexo.extend.helper.register('popular_posts_json', require('./lib/helper-json'));

