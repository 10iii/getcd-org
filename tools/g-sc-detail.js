(function () {
	"use strict";
	var util = require("util");
	var Crawler = require("crawler").Crawler;
	var gquery = require('../gcd-query.js');
	var fs = require("fs");
	var myquery = gquery.gq;
	var myqs = gquery.gqs;
	var escap = gquery.escapes;
	var MAX_RETRY = 10;
	var retry_time = {};
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
	var sqlstr = "SELECT MAX(updtime) as lasttime  FROM gcd_entry";
	myquery(sqlstr,function (res) {
		if (util.isArray(res)&&res[0]["lasttime"]) {
			//MAX_TIME = res[0]["lasttime"];
		}
	});
	console.log(MAX_TIME);

	var parsemain = function (error, result) {
		if (error){
			throw error;
		}
		if (result.statusCode != '200') {
			if (!(retry_time[result.uri]) || retry_time[result.uri] < MAX_RETRY) {
				retry_time[result.uri] = retry_time[result.uri]?retry_time[result.uri] + 1 : 1;
				util.log(result.uri + " - " + result.statusCode + " - " + "retry...");
				c.queue([{
					"uri" : result.uri,
					"callback" : parsemain
				}]);
			} else {
				util.log(result.uri + " - " + result.statusCode + " - " + "fail...");
			}
		} else {
			/*
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
				console.log(result.body.length);
				//util.log(result.uri + " - " + result.statusCode + " - " + "parsed items" + " - " + matchgroup.length);
			} else {
				util.log(result.uri + " - " + result.statusCode + " - " + "parse failure");
			}*/
				console.log(result.body.length);
		}
	};
	var parsehashlink = function (error, result) {
		if (error){
			throw error;
		}
		var i;
	};
	var c = new Crawler({
		"maxConnections" : 2,
		"jQuery" : false,
		"forceUTF8" : true,
		"callback" : function (error,result) {
			if (error){
				throw error;
			}
		},
		"onDrain" : function () {
			if (addwork(10) === 0) {
			}
		}
	});
	var addwork = function(work_id){
		var sqlstr = '';
		sqlstr = "UPDATE gcd_entry_test SET fetch_flag = '"+work_id+"' WHERE fetch_flag = 0 ORDER BY updtime LIMIT 100";
		console.log(sqlstr);
		var res = myqs(sqlstr);
		console.log(res);
		if (isNaN(res)) {
			throw new Error("when get un-fetch records...");
			process.exit();
		}
		if (res > 0) {
			sqlstr = "INSERT INTO gcd_topic_imp_sc () SELECT * FROM gcd_entry_test WHERE fetch_flag = '"+work_id+"' ";
			console.log(sqlstr);
			myqs(sqlstr);
			sqlstr = "SELECT res_link FROM gcd_entry_test WHERE fetch_flag = '"+work_id+"' ";
			myquery(sqlstr,function (result) {
				var i = 0, len = result.length;
				for (i = 0; i < len; i += 1) {
					c.queue([{
						"uri" : result[i]["res_link"],
						"callback" : parsemain
					}]);
				}
			});
		}
		return res;
	}
/*
	var addwork = function(work_id){
		var sqlstr = '';
		sqlstr = ''
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
*/
	addwork(10);


}());
