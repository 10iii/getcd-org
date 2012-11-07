(function () {
  "use strict";
  var Crawler = require("crawler").Crawler;
  var tt=[];
  var regs = /<td class="cover-info">\s*?<a href="\/entry\/([a-zA-Z0-9]+?)\/">\s*?<img class="cover" src="(.+?)" \/><\/a>[\S\s]+?"><div class="title">([\S\s]+?)<\/div><\/a>\s*?<div class="abstract">([\S\s]+?)<\/div>\s*?<div class="description">([\S\s]+?)<\/div>\s*?<div class="datetime">\s*?<b>\S*?<\/b>:<i>([\S\s]+?);<\/i>\s*?<b>\S*?<\/b>:<i>([\S\s]+?)<\/i>\s*?<\/div>[\S\s]+?<td class="user-info">\s*?<img src='\S*?' title='([\S]+?)'/g;
  var regs2 = /<td class="cover-info">\s*?<a href="\/entry\/([a-zA-Z0-9]+?)\/">\s*?<img class="cover" src="(.+?)" \/><\/a>[\S\s]+?"><div class="title">([\S\s]+?)<\/div><\/a>\s*?<div class="abstract">([\S\s]+?)<\/div>\s*?<div class="description">([\S\s]+?)<\/div>\s*?<div class="datetime">\s*?<b>\S*?<\/b>:<i>([\S\s]+?);<\/i>\s*?<b>\S*?<\/b>:<i>([\S\s]+?)<\/i>\s*?<\/div>[\S\s]+?<td class="user-info">\s*?<img src='\S*?' title='([\S]+?)'/;
  var c = new Crawler({
    "maxConnections" : 10,
    "jQuery" : false,
    "forceUTF8" : true,
    "callback" : function (error,result) {
      if (error){
        throw error;
      }
      //console.log(result.body);
      var matchgroup = result.body.toString().match(regs);
      for (var i = 0, len = matchgroup.length; i < len; i++){
        console.log(matchgroup[i]);
        var items = regs2.exec(matchgroup[i]);
        
        console.log(items);
      }
    },
    "onDrain" : function () {
      process.exit();
    }
  });

  var addwork = function(){
    var pagecount = 0;
    var refunc = function (c){
      pagecount++;
      var uri = "http://simplecd.me/category/?flag=1&page=" + pagecount;
      //console.log(uri);
      c.queue(uri);

    }
    return refunc;
  }();

  addwork(c);


}());


//    uri: String, the URL you want to crawl
//    timeout : Number, in milliseconds (Default 60000)
//    method, xxx: All mikeal's requests options are accepted

//Callbacks:

//    callback(error, result, $): A request was completed
//    onDrain(): There is no more queued requests

//Pool options:

//    maxConnections: Number, Size of the worker pool (Default 10),
//    priorityRange: Number, Range of acceptable priorities starting from 0 (Default 10),
//    priority: Number, Priority of this request (Default 5),

//Retry options:

//    retries: Number of retries if the request fails (Default 3),
//    retryTimeout: Number of milliseconds to wait before retrying (Default 10000),

//Server-side DOM options:

//    jQuery: Boolean, if true creates a server-side DOM and adds jQuery (Default true)
//    jQueryUrl: String, path to the jQuery file you want to insert (Defaults to bundled jquery-1.8.1.min.js)

//Charset encoding:

//    forceUTF8: Boolean, if true will try to detect the page charset and convert it to UTF8 if necessary. Never worry about encoding anymore! (Default false),

//Cache:

//    cache: Boolean, if true stores requests in memory (Default false)
//    skipDuplicates: Boolean, if true skips URIs that were already crawled, without even calling callback() (Default false)

// This will be called for each crawled page
//    "callback":function(error,result,$) {
//
//        // $ is a jQuery instance scoped to the server-side DOM of the page
//        $("#content a:link").each(function(a) {
//            c.queue(a.href);
//        });
//    }
