'use strict';

var kuromoji = require("kuromoji");
var fs       = require('fs');
var pathFn   = require('path');
var util     = require('./util.js');
var lg       = require('./log.js');
    
var negativeWords  = [];
var wordsLimit     = null;
var _tokenizer     = null;
var isBuildWaiting = false;

module.exports.getKeyword = function(config , post , callbackFn) {
    
    if(config.popularPosts && config.popularPosts.morphologicalAnalysis !== undefined && (config.language == "ja" || config.language == "en")){
        
        lg.setConfig(config);
        
        var kuromoji_path1 = pathFn.normalize(__dirname+"/../node_modules/kuromoji/dict/");
        var kuromoji_path2 = pathFn.normalize(__dirname+"/../../kuromoji/dict/");
        var path_case1     =  fs.existsSync( kuromoji_path1 );
        var path_case2     =  fs.existsSync( kuromoji_path2 );
        
        if(config.popularPosts.morphologicalAnalysis && config.popularPosts.morphologicalAnalysis.negativeKeywordsList){
            var nwPath = pathFn.join(process.env.PWD , config.popularPosts.morphologicalAnalysis.negativeKeywordsList);
            
            if(fs.existsSync( nwPath )){
                var negativeWordTmp = fs.readFileSync( nwPath , "utf-8");
                negativeWords = negativeWordTmp.split("\n");
            }
        }
        
        if(config.popularPosts.morphologicalAnalysis && config.popularPosts.morphologicalAnalysis.limit){
            wordsLimit = Number(config.popularPosts.morphologicalAnalysis.limit);
        }
        if(path_case1 || path_case2){
            if(_tokenizer == null){
                if(!isBuildWaiting){
                    isBuildWaiting = true;
                    lg.log("info", "(Loading Directory) Plugin is loading a morphological analysis dictionary. Please wait for a little while..." , null , false);
                    kuromoji.builder({ dicPath: path_case1 ? kuromoji_path1 : kuromoji_path2 }).build(function (err, tokenizer) {
                        _tokenizer = tokenizer;
                        isBuildWaiting = false;
                        takenize(post , callbackFn);
                    });
                }else{
                    wait_takenize(post , callbackFn);
                }
            }else{
                takenize(post , callbackFn);
            }
            
        }else{
            callbackFn("Not found path" , [] , 0 );
        }
    }else{
        callbackFn("Please set options" , [] , 0 );
    }
};


function wait_takenize( post , callbackFn ){
    if(_tokenizer == null){
        setTimeout( function(){call_wait_takenize(post , callbackFn);} , 1000 );
    }else{
        takenize( post , callbackFn );
    }
}


function call_wait_takenize( post , callbackFn ){
    wait_takenize(post , callbackFn);
}


function takenize( post , callbackFn ){
    
    var i         = 0;
    var k         = 0;
    var keyword   = [];
    var resultTKR = _tokenizer.tokenize(post.title +"\n" + util.decord_unicode(util.replaceHTMLtoText(post.content)));
    
    for( i = 0; i < resultTKR.length; i++){
        if(resultTKR[i].pos == "名詞" && !util.isMatchedElement(resultTKR[i].surface_form, negativeWords)){
            var findFlg = false;
            for(k = 0; k < keyword.length; k++){
                if(keyword[k].w == resultTKR[i].surface_form){
                    keyword[k].f = keyword[k].f + 1;
                    findFlg = true;
                    break;
                }
            }
            if(!findFlg){
                // w: keyword
                // f: frequency (The words which appear frequency.)
                keyword.push({"w":resultTKR[i].surface_form, "f":1});
            }
        }
    }
    
    keyword.sort(function (a,b){
        return (b.f - a.f);
    });
    
    var wordsLength = keyword.length;
    if(wordsLimit != 0 && wordsLimit){
        var tmpKeyWord = [];
        for(i = 0; i < wordsLimit && i < keyword.length; i++){
            tmpKeyWord.push(keyword[i]);
        }
        keyword = null;
        keyword = tmpKeyWord;
    }else if(wordsLimit == 0){
        keyword = null;
        keyword = [];
    }
    callbackFn(null , keyword , wordsLength);
}