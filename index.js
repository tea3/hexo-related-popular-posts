'use strict';

var pathFn       = require('path');

var fs           = require('hexo-fs');
var assign       = require('object-assign');
var gaAnalytics  = require('ga-analytics');
var mkdirp       = require('mkdirp');
var moment       = require('moment');

var dr           = require('./lib/dateRange.js');
var dateRangeArr = null;
var gaData       = null;

var ndt = new Date();
  	ndt = ndt.getTime();

// option
var dateRange                 = 30;
var id                        = null;
var email                     = null;
var key                       = null;
var viewId                    = null;
var cache_path                = null;
var cache_exexpires           = 10;



// get setting from _config.yml
if(hexo.config.popularPosts && hexo.config.popularPosts.googleAnalyticsAPI.dateRange){
	dateRange = Number(hexo.config.popularPosts.googleAnalyticsAPI.dateRange);
}
dateRangeArr = dr.getDateRange(dateRange);

if(hexo.config.popularPosts && hexo.config.popularPosts.googleAnalyticsAPI && hexo.config.popularPosts.googleAnalyticsAPI.clientId && hexo.config.popularPosts.googleAnalyticsAPI.serviceEmail && hexo.config.popularPosts.googleAnalyticsAPI.key && hexo.config.popularPosts.googleAnalyticsAPI.viewId){
	id          = hexo.config.popularPosts.googleAnalyticsAPI.clientId;
	email       = hexo.config.popularPosts.googleAnalyticsAPI.serviceEmail;
	key         = pathFn.join(process.env.PWD , hexo.config.popularPosts.googleAnalyticsAPI.key);
	viewId      = 'ga:' + hexo.config.popularPosts.googleAnalyticsAPI.viewId;
}else if(process.env.GOOGLEAPI_CLIENTID && process.env.GOOGLEAPI_EMAIL && process.env.GOOGLEAPI_KEY && process.env.GOOGLEAPI_ANALYTICS_TABLE){
	id          = process.env.GOOGLEAPI_CLIENTID;
	email       = process.env.GOOGLEAPI_EMAIL;
	key         = process.env.GOOGLEAPI_KEY;
	viewId      = process.env.GOOGLEAPI_ANALYTICS_TABLE;
}

if(hexo.config.popularPosts && hexo.config.popularPosts.googleAnalyticsAPI.cache && hexo.config.popularPosts.googleAnalyticsAPI.cache.path && hexo.config.popularPosts.googleAnalyticsAPI.cache.expiresDate){
	cache_path = pathFn.join(process.env.PWD , hexo.config.popularPosts.googleAnalyticsAPI.cache.path);
	cache_exexpires = Number(hexo.config.popularPosts.googleAnalyticsAPI.cache.expiresDate);
}


// orverride config.popularPosts
hexo.config.popularPosts = assign( {}, 
	hexo.config.popularPosts, {
		"tmp" : {
			"dateRange"                 : dateRange,
			"id"                        : id,
			"email"                     : email,
			"key"                       : key,
			"viewId"                    : viewId,
			"cache_path"                : cache_path,
			"cache_exexpires"           : cache_exexpires,
			"startDate"					: dateRangeArr[0],
			"endDate" 					: dateRangeArr[1],
			"gaData"					: [] , 
			"isAlert"					: false ,
			"isGaDataOpt"				: false
		}
	}
);

function orverrideTmp(inGaData){
	// orverride config.popularPosts.tmp
	hexo.config.popularPosts.tmp = assign( {}, 
		hexo.config.popularPosts.tmp , {
			"gaData" : inGaData
		}
	);
}



// load cache data
var isGACache = false;
if(cache_path && fs.existsSync(cache_path)){
	gaData = fs.readFileSync(cache_path);
  	gaData = JSON.parse(gaData);
  	
  	if(gaData[0].cachedDate &&  (ndt - gaData[0].cachedDate) < cache_exexpires*24*60*60*1000 ){
		isGACache = true;
	}
	
	orverrideTmp(gaData[0].gaData);
}

// load analytics
if(!isGACache){
	if(id && email && key && viewId){
		gaAnalytics({
		    dimensions  : 'ga:pagePath', 
		    metrics     : 'ga:pageviews', 
		    clientId    : id, 
		    serviceEmail: email, 
		    key         : key, 
		    ids         : viewId, 
		    startDate   : dateRangeArr[0], 
		    endDate     : dateRangeArr[1],
		    sort        : '-ga:pageviews'
		}, function (err, res) {
		    if (err) {
		    	console.log("\u001b[31m[hexo-related-popular-posts] (ga-analytics error) "+ err +"\u001b[0m ");
		        // console.error(err);
		        // process.exit(1);
		    } else {
		        // console.log(res.rows);
		        gaData = [{ "cachedDate":ndt , "gaData":[] }];
		        if(res.rows && res.rows.length > 0){
		        	for(var i=0; i<res.rows.length; i++){
		        		gaData[0].gaData.push( {
		        			"title":"" ,
		        			"path": res.rows[i][0] ,
		        			"eyeCatchImage" : "" ,
		        			"excerpt" : "" ,
		        			"date" : "" ,
		        			"pv": Number(res.rows[i][1])
		        		} );
		        	}
		        }
		        // generate cache file
		        if(cache_path){
		        	mkdirp.sync( pathFn.dirname( cache_path ));
		        	fs.writeFileSync( cache_path , JSON.stringify( gaData ) );
		        	console.log("\u001b[32m[hexo-related-popular-posts] Google Analytics Data was refreshed and saved. "+ cache_path +"\u001b[0m ");
		        }
		        
		        orverrideTmp(gaData[0].gaData);
		    }
		});
	}
}

hexo.extend.filter.register('after_post_render', require('./lib/collector') );
hexo.extend.helper.register('popular_posts', require('./lib/helper'));
hexo.extend.helper.register('popular_posts_json', require('./lib/helper-json'));

