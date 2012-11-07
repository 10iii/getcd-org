(function () {
	"use strict";
	var Crawler = require("crawler").Crawler;
	var fs = require("fs");
	var tt=[];
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
	c.queue([{
		"uri" : 'http://i.simplecd.me/Yso1e5wH.jpg',
		"forceUTF8" : false,
		"callback" : function (error,result) {
			if (error) throw error;
			console.log(result.statusCode);
			console.log(result.headers);
			//console.log(result.);
			result.setEncoding("binary");
			fs.writeFile("./test2.jpg",result.body,"binary",function(){console.log("done.")});
		},
	}]);
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
