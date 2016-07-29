
'use strict';

module.exports.getDateRange = function(inDateRange){
    var nDate         = new Date();
    var endDateMSec = nDate.getTime() - 24*60*60*1000;
    var startDateMSec = endDateMSec - inDateRange*24*60*60*1000;
    
    return [ getDateStr(startDateMSec) , getDateStr(endDateMSec) ];
};

function getDateStr(inUnixDateTime){
    var d         = new Date(inUnixDateTime);
    var myYear    = d.getFullYear();
    var myMonth   = d.getMonth() + 1;
    var myDate    = d.getDate();
    return String(myYear) +"-"+ zeroPadding(myMonth,2) +"-"+ zeroPadding(myDate,2);
};

function zeroPadding(inNum, inDigitsNum){
    var num;
    if( !inNum ){
      num = 0;
    }else{
      num = Number(inNum);
    }
    var zeroString = "";
    for(var i=0; i<inDigitsNum; i++){
        zeroString += "0";
    }
    return (zeroString + String(num)).slice(-1*inDigitsNum);
}