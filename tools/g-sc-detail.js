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
	var table_name = 'gcd_entry_test';
	var retry_time = {};
	var regs = /<\/span>\s*?<span><a href="\/category\/\S+?\/">(\S*?)<\/a> &gt;\s*?<a href="\/category\/\S+?\/">(\S*?)<\/a><\/span>[\s\S]*?<tr><td class="needemule" colspan="3"><a href="http([\s\S]*?)<input type="checkbox" id="checkallemule" name="checkbox">[\s\S]*?<td class="post"><a target="_blank" href="\/search\/\?fromeid=(\w+?)&mode=relate">[\s\S]+?<table class="description">([\s\S]*?)<\/table>\s*?<table class="ad-in-entry">[\s\S]*?<div class="ad-entry-sidebar-2">[\s\S]*?<table class="user-recommend">[\s\S]*?<\/table>[\s\S]*?<div class="ad-entry-sidebar-2">[\s\S]*?<table class="user-recommend">([\s\S]*?)<\/table>[\s\S]*?<div class="ad-entry-sidebar-2">[\s\S]*?<table class="user-recommend">([\s\S]*?)<\/table>/;
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
	var sqlstr = "TRUNCATE TABLE gcd_topic_imp_sc";
	myqs(sqlstr);
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
			var matchgroup = regs.exec(result.body.toString());
			if (matchgroup) {
				/*
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
				}*/
				console.log(matchgroup[1]);
				//util.log(result.uri + " - " + result.statusCode + " - " + "parsed items" + " - " + matchgroup.length);
			} else {
				util.log(result.uri + " - " + result.statusCode + " - " + "parse failure");
			}
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
	var addwork = function () {
		var work_id = 5;
		var tmp = function () {
			work_id += 1;
			var sqlstr = '';
			sqlstr = "UPDATE " + table_name + " SET fetch_flag = '"+work_id+"' WHERE fetch_flag = 0 ORDER BY updtime LIMIT 100";
			console.log(sqlstr);
			var res = myqs(sqlstr);
			console.log(res);
			if (isNaN(res)) {
				throw new Error("when get un-fetch records...");
				process.exit();
			}
			if (res > 0) {
				sqlstr = "INSERT INTO gcd_topic_imp_sc () SELECT * FROM " + table_name + " WHERE fetch_flag = '"+work_id+"' ";
				console.log(sqlstr);
				myqs(sqlstr);
				sqlstr = "SELECT res_link FROM " + table_name + " WHERE fetch_flag = '"+work_id+"' ";
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
		};
	return tmp;	
	}();
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
