'use strict';

var pathFn       = require('path');
var fs           = require('hexo-fs');
var assign       = require('object-assign');
var moment       = require('moment');
var util         = require('./lib/util.js');
var dr           = require('./lib/dateRange.js');
var su           = require('./lib/settingsUpdate.js');
var lg           = require('./lib/log.js');
var pjson        = require('./package.json');
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
var rankingSheet                 = null;
var cache_exexpires              = 10;
var pvMeasurementsStartDate      = "";
var weight_of_tag_relevancy      = 1.0;
var weight_of_contents_relevancy = 1.0;
var isLog 						 = true;

// get setting from _config.yml
if( hexo.config.popularPosts ){

	if( hexo.config.popularPosts.googleAnalyticsAPI ){
		// Deprecated message
		if( hexo.config.popularPosts.googleAnalyticsAPI.cache && ( hexo.config.popularPosts.googleAnalyticsAPI.cache.path != undefined || hexo.config.popularPosts.googleAnalyticsAPI.cache.expiresDate != undefined ) ){
			lg.log("error", "(Deprecated option) 'googleAnalyticsAPI.cache.path' and 'googleAnalyticsAPI.cache.expiresDate' are deprecated. Please set the 'cache.path' and 'googleAnalyticsAPI.expiresDate' option." , "_config.yml" , true);
			return;
		}

		// google analytics option
		if( hexo.config.popularPosts.googleAnalyticsAPI.dateRange){
			dateRange = Number(hexo.config.popularPosts.googleAnalyticsAPI.dateRange);
		}

		if( hexo.config.popularPosts.googleAnalyticsAPI.clientId && hexo.config.popularPosts.googleAnalyticsAPI.serviceEmail && hexo.config.popularPosts.googleAnalyticsAPI.key && hexo.config.popularPosts.googleAnalyticsAPI.viewId){
			id          = hexo.config.popularPosts.googleAnalyticsAPI.clientId;
			email       = hexo.config.popularPosts.googleAnalyticsAPI.serviceEmail;
			key         = pathFn.join(process.env.PWD || process.cwd() , hexo.config.popularPosts.googleAnalyticsAPI.key);
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
		
		if( hexo.config.popularPosts.googleAnalyticsAPI.pvMeasurementsStartDate != undefined){
			var pvmstd = String(hexo.config.popularPosts.googleAnalyticsAPI.pvMeasurementsStartDate);
			pvmstd = dr.getDateStrFromDate( new Date(pvmstd) );
			if(pvmstd.match(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/)){
				pvMeasurementsStartDate = pvmstd;
			}else{
				lg.log("error", "Please check the 'pvMeasurementsStartDate' option. This option should be written in the form 'YYYY-MM-DD' ." , "_config.yml" , true);
				return;
			}
		}

		if( hexo.config.popularPosts.googleAnalyticsAPI.expiresDate != undefined){
			cache_exexpires = Number(hexo.config.popularPosts.googleAnalyticsAPI.expiresDate);
		}
		
		if( hexo.config.popularPosts.googleAnalyticsAPI.rankingSheet && hexo.config.popularPosts.googleAnalyticsAPI.rankingSheet){
			rankingSheet = pathFn.join(process.env.PWD || process.cwd() , hexo.config.popularPosts.googleAnalyticsAPI.rankingSheet);
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
		cache_path = pathFn.join(process.env.PWD || process.cwd() , hexo.config.popularPosts.cache.path);
	}
	
	// log option
	if( hexo.config.popularPosts.log != undefined){
		isLog = hexo.config.popularPosts.log;
	}
}
dateRangeArr = dr.getDateRange(dateRange);


// orverride config.popularPosts
hexo.config.popularPosts = assign( {}, 
	hexo.config.popularPosts, {
		"tmp" : {
			"isLog"                       : isLog , 
			"negativewordsUpdate"         : ngwHash ,
			"cacheUpdate"                 : "" ,
			"isNgwUpdate"                 : true , 
			"isGaUpdate"                  : true ,
			"settingsUpdate"              : shash ,
			"version" 					  : pjson.version ,
			"dateRange"                   : dateRange ,
			"id"                          : id ,
			"email"                       : email ,
			"key"                         : key ,
			"viewId"                      : viewId ,
			"cache_path"                  : cache_path ,
			"rankingSheet"				  : rankingSheet ,
			"cache_exexpires"             : cache_exexpires ,
			"pvMeasurementsStartDate"     : pvMeasurementsStartDate ,
			"old_cacheDate"               : "" ,
			"weight_of_tag_relevancy"     : weight_of_tag_relevancy ,
			"weight_of_contents_relevancy": weight_of_contents_relevancy ,
			"startDate"                   : dateRangeArr[0] ,
			"endDate"                     : dateRangeArr[1],
			"gaData"                      : [] ,
			"postPath"					  : []
		}
	}
);

lg.setConfig(hexo.config);

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
			hexo.config.popularPosts.tmp.isGaUpdate = false;
		}
		hexo.config.popularPosts.tmp.old_cacheDate = gaData[0].cachedDate;
  	}else{
  		gaData = null;
  	}
  	
	if(gaData){
		util.orverrideTmp(gaData[0].gaData , hexo);
	}else{
		util.orverrideTmp([] , hexo);
	}
}

hexo.extend.filter.register('after_init', require('./lib/googleAnalytics'), {async: true});
hexo.extend.filter.register('after_post_render', require('./lib/collector'), {async: true});
hexo.extend.filter.register('after_generate', require('./lib/cache'));
hexo.extend.helper.register('popular_posts', function(options, forcePost){
	return require('./lib/helper')(options , this , hexo , forcePost);
});
hexo.extend.helper.register('popular_posts_json', function(options , forcePost){
	return require('./lib/helper-json')(options , this , hexo , forcePost);
});
hexo.extend.helper.register('popular_posts_pv', require('./lib/pv'));

