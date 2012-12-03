(function () {
	"use strict";
	var util = require("util");
	var Crawler = require("crawler").Crawler;
	var gquery = require('../gcd-query.js');
	var fs = require("fs");
	var myquery = gquery.gq;
	var myqs = gquery.gqs;
	var escap = gquery.escapes;
	var regs = /<td class="cover-info">\s*?<a href="\/entry\/([a-zA-Z0-9]+?)\/">\s*?<img class="cover" src="(.+?)" \/><\/a>[\S\s]+?"><div class="title">([\S\s]+?)<\/div><\/a>\s*?<div class="abstract">([\S\s]+?)<\/div>\s*?<div class="description">([\S\s]+?)<\/div>\s*?<div class="datetime">\s*?<b>\S*?<\/b>:<i>([\S\s]+?);<\/i>\s*?<b>\S*?<\/b>:<i>([\S\s]+?);<\/i>\s*?<\/div>[\S\s]+?<td class="user-info">\s*?<img src='\S*?' title='([\S]+?)'/g;
	var regs2 = /<td class="cover-info">\s*?<a href="\/entry\/([a-zA-Z0-9]+?)\/">\s*?<img class="cover" src="(.+?)" \/><\/a>[\S\s]+?"><div class="title">([\S\s]+?)<\/div><\/a>\s*?<div class="abstract">([\S\s]+?)<\/div>\s*?<div class="description">([\S\s]+?)<\/div>\s*?<div class="datetime">\s*?<b>\S*?<\/b>:<i>([\S\s]+?);<\/i>\s*?<b>\S*?<\/b>:<i>([\S\s]+?);<\/i>\s*?<\/div>[\S\s]+?<td class="user-info">\s*?<img src='\S*?' title='([\S]+?)'/;
	var timeclean = function (ori) {
		var ori = ori.toString().trim();
		var reg = /(\d{4})\D+?(\d{2})\D+?(\d{2})\D+?\s+(\d{2})\D+?(\d{2})\D+?/;
		var item = reg.exec(ori);
		if (util.isArray(item) && item.length === 6) {
			return (item[1]+'-'+item[2]+'-'+item[3]+' '+item[4]+':'+item[5]+':00');
		} else {
			return '';
		}
	};
	var MAX_TIME = new Date('1990-01-01 00:00:00');
	var MAX_PAGE = 20010;
	if (process.argv[2]) {
		MAX_TIME = new Date(process.argv[2]);
	} else {
		var sqlstr = "SELECT MAX(updtime) as lasttime  FROM gcd_entry";
		var res = myqs(sqlstr);
		if (res[0]["lasttime"]) {
			MAX_TIME = new Date(res[0]["lasttime"].toUTCString() + '+0800');
		}
	}
	console.log(MAX_TIME);
	var c = new Crawler({
		"maxConnections" : 2,
		"jQuery" : false,
		"forceUTF8" : true,
		"callback" : function (error,result) {
			if (error){
				util.log(error);
				return;
			}
			var continueflag = true;
			//console.log(result.body);
			//console.log(result.statusCode);
			if (result.statusCode.toString().substr(0,2) == '50') {
				util.log(result.uri + " - " + result.statusCode + " - " + "retry...");
				c.queue(result.uri);
			} else if (result.statusCode == '200') {
				var matchgroup = result.body.toString().match(regs);
				if (util.isArray(matchgroup)) {
					var sqlstr = "INSERT `gcd_entry` (`entry_id`, `topic_id`, `res_site`," +
						" `res_id`, `title`, `author`," +
						" `brief`, `abstract`, `pubtime`," +
						" `updtime`, `res_link`, `thumb_link`," +
						" `image_link`, `post_flag`, `posttime`," +
						" `thumb_flag`, `image_flag`, `fetch_flag`," +
						" `res_html`, `entrytime`) VALUES ";
					var valuestr = [];
					for (var i = 0, len = matchgroup.length; i < len; i++) {
						var items = regs2.exec(matchgroup[i]);
						if (items.length == 9) {
							if (new Date(timeclean(items[7].trim())) < MAX_TIME) {
								continueflag = false;
							} else {
								valuestr.push("(DEFAULT, " +
									" 'SC" + escap(items[1].trim()) + "'," +
									" 'SC'," +
									" '" + escap(items[1].trim()) + "'," +
									" '" + escap(items[3].trim()) + "'," +
									" '" + escap(items[8].trim()) + "'," +
									" '" + escap(items[5].trim()) + "'," +
									" '" + escap(items[4].trim()) + "'," +
									" '" + escap(timeclean(items[6].trim())) + "'," +
									" '" + escap(timeclean(items[7].trim())) + "'," +
									" '" + escap('http://simplecd.me/entry/' + items[1].trim() + '/') + "'," +
									" '" + escap(items[2].trim()) + "'," +
									" NULL," +
									" 0," +
									" NULL," +
									" 0," +
									" 0," +
									" 0," +
									" NULL," +
									"NOW() )"
								);
							}
						} else {
							util.log(result.uri + " - " + result.statusCode + " - " + "bad item");
						}
					}
					if (valuestr.length > 0) {
						sqlstr += valuestr.join(', ');
						myquery(sqlstr, function (rows) {
							util.log(result.uri + " - " + "insert DB rows" + " - " + rows);
						});
					}
					//console.log(sqlstr);
					util.log(result.uri + " - " + result.statusCode + " - " + "parsed items" + " - " + matchgroup.length);
				} else {
					util.log(result.uri + " - " + result.statusCode + " - " + "parse failure");
				}
				if (continueflag) {
					addwork(c);
				} else {
					util.log("Over max datetime, stop thread...");
				}
			} else {
				util.log(result.uri + " - " + result.statusCode + " - " + "Ignore...");
				addwork(c);
			}
		},
		"onDrain" : function () {
				setTimeout(function () {
					util.log("DONE.");
					process.exit();
				},600000);
		}
	});

	var addwork = function(){
		var pagecount = 0;
		var refunc = function (c){
			pagecount++;
			fs.writeFile('pagelog~', '' + pagecount, function (err) {
				  if (err) throw err;
			});
			var uri = "http://simplecd.me/category/?flag=1&page=" + pagecount;
			//console.log(uri);
			if (pagecount <= MAX_PAGE) {
				c.queue(uri);
			} else {
				util.log("Over max page number, stop thread...");
			}

		}
		return refunc;
	}();

	addwork(c);
	addwork(c);
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
