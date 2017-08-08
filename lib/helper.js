'use strict';

module.exports = function(options , inPost , inHexo , inForcePost) {
    
    var listJson   = require('./list-json.js');
    // var lj         = listJson.getList(options , this);
    var lj         = listJson.getList(options , inPost , inHexo, inForcePost);
    var returnHTML = "";
    
    
    
    function generateHTML(list){
        
        var ret = "";
        ret += "<li class=\"" + lj.class + "-item\">";
        
        if(list.date && list.date != ""){
            ret += '<div class="'+lj.class+'-date">' + list.date + "</div>";
        }
        
        if(list.img && list.img != ""){
            ret += '<div class="'+lj.class+'-img">' + '<img src="'+list.img+'" />' + "</div>";
        }
        ret += '<div class="'+lj.class+'-title"><h3><a href="' + list.path + '" title="'+ list.title +'" rel="bookmark">'+ list.title + "</a></h3></div>";
        if(list.excerpt &&  list.excerpt != ""){
            ret += '<div class="'+lj.class+'-excerpt"><p>' + list.excerpt + "</p></div>";
        }
        
        ret +=  "</li>";
        return ret;
    }
    
    for(var i=0; i < lj.json.length; i++){
        returnHTML += generateHTML(lj.json[i]);
    }
    
    if(returnHTML != "") returnHTML = "<ul class=\"" + lj.class + "\">" + returnHTML + "</ul>";

  return returnHTML;
}