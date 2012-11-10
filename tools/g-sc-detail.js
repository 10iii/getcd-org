(function () {
	"use strict";
	var util = require("util");
	var Crawler = require("crawler").Crawler;
	var gquery = require('../gcd-query.js');
	var fs = require("fs");
	var urltool = require("url");
	var myquery = gquery.gq;
	var myqs = gquery.gqs;
	var escap = gquery.escapes;
	var MAX_RETRY = 10;
	var table_name = 'gcd_entry_test';
	var retry_time = {};
	var regs = /<\/span>\s*?<span><a href="\/category\/\S+?\/">(\S*?)<\/a> &gt;\s*?<a href="\/category\/\S+?\/">(\S*?)<\/a><\/span>[\s\S]*?<tr><td class="needemule" colspan="3"><a href="http([\s\S]*?)<input type="checkbox" id="checkallemule" name="checkbox">[\s\S]*?<td class="post"><a target="_blank" href="\/search\/\?fromeid=(\w+?)&mode=relate">[\s\S]+?(<table class="description">[\s\S]*?<\/table>)\s*?<table class="ad-in-entry">[\s\S]*?<div class="ad-entry-sidebar-2">[\s\S]*?<table class="user-recommend">[\s\S]*?<\/table>[\s\S]*?<div class="ad-entry-sidebar-2">[\s\S]*?<table class="user-recommend">[\s\S]*?<\/table>[\s\S]*?<div class="ad-entry-sidebar-2">[\s\S]*?<table class="user-recommend">([\s\S]*?)<\/table>/;
	var regrelated = /<tr><td class="cover"><img src="http[\s\S]*?title="([\s\S]*?)" \/><\/td><td><a href="\/entry\/(\S+?)">/g;
	var regrelated2 = /<tr><td class="cover"><img src="http[\s\S]*?title="([\s\S]*?)" \/><\/td><td><a href="\/entry\/(\S+?)">/;
	var reglink = /<input type="checkbox" value="(\S+?)" name="selectemule" filesize=/g;
	var reglink2 = /<input type="checkbox" value="(\S+?)" name="selectemule" filesize=/;
	var reghash = /<a style="background-color:#EEF2F7;padding:5px;line-height:1.8;" target="_blank" href="(ed2k:\/\/[\s\S]+?\/)">([\s\S]+?)<\/a>/g;
	var reghash2 = /<a style="background-color:#EEF2F7;padding:5px;line-height:1.8;" target="_blank" href="(ed2k:\/\/[\s\S]+?\/)">([\s\S]+?)<\/a>/;

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
	console.log('art');
	var sqlstr = "TRUNCATE TABLE gcd_topic_imp_sc";
	var tmp = myqs(sqlstr);
	console.log('start');
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
			var items = regs.exec(result.body.toString());
			if (items) {
				var relatedarr = [];
				var matchrelated = items[6].match(regrelated);
				var i = 0, len = matchrelated.length, reitem;
				for (i = 0; i < len; i += 1) {
					reitem = regrelated2.exec(matchrelated[i]);
					relatedarr.push({
						"topic_id" : 'SC' + reitem[2],
						"title" : reitem[1]
					});
				}
				var sqlstr = "UPDATE `gcd_topic_imp_sc` SET " +
					"`main_category` = '" + escap(items[1]) + "', " +
					"`sub_category` = '" + escap(items[2]) + "', " +
					"`content` = '" + escap(items[5]) + "', " +
					"`related` = '" + escap(JSON.stringify(relatedarr)) + "' " +
					" WHERE topic_id = 'SC" + escap(items[4]) + "' " ;
				myquery(sqlstr, function (rows) {
					util.log(result.uri + " - " + "update topic" + " - " + items[4]);
				});
				sqlstr = "UPDATE `" + table_name + "` SET " +
					"`fetch_flag` = 1, " +
					"`res_html` = '" + escap(result.body.toString()) + "' "+
					" WHERE topic_id = 'SC" + escap(items[4]) + "' " ;
				myquery(sqlstr, function (rows) {
					util.log(result.uri + " - " + "update entry res_html" + " - " + items[4]);
				});
				var linkarr = [];
				var matchlink = items[3].match(reglink);
				len = matchlink.length;
				for (i = 0; i < len; i += 1) {
					reitem = reglink2.exec(matchlink[i]);
					linkarr.push(reitem[1]);
				}
				c.queue([{
					"uri" : 'http://simplecd.me/download/?seperate=copy&rid=' + linkarr.join('&rid=') + '&topicid=' + items[4],
					"callback" : parsehashlink
				}]);
				util.log(result.uri + " - " + result.statusCode + " - " + "parsed " + " - " + items[4]);
			} else {
				util.log(result.uri + " - " + result.statusCode + " - " + "parse failure");
			}
		}
	};
	var parsehashlink = function (error, result) {
		if (error){
			throw error;
		}
		if (result.statusCode != '200') {
			if (!(retry_time[result.uri]) || retry_time[result.uri] < MAX_RETRY) {
				retry_time[result.uri] = retry_time[result.uri]?retry_time[result.uri] + 1 : 1;
				util.log(result.uri + " - " + result.statusCode + " - " + "retry...");
				c.queue([{
					"uri" : result.uri,
					"callback" : parsehashlink
				}]);
			} else {
				util.log(result.uri + " - " + result.statusCode + " - " + "fail...");
			}
		} else {
			var matchhash = result.body.toString().match(reghash);
			if (util.isArray(matchhash)) {
				var hasharr = [], i, len = matchhash.length, item;
				for (i = 0; i < len; i += 1) {
					item = reghash2.exec(matchhash[i]);
					hasharr.push({
						"title" : item[2],
						"link" : item[1]
					});
				}
				var urlpart = urltool.parse(result.uri,true);
				var urlobj = urlpart.query;

				var sqlstr = "UPDATE `gcd_topic_imp_sc` SET " +
					"`hash_link` = '" + escap(JSON.stringify(hasharr)) + "' " +
					" WHERE topic_id = 'SC" + escap(urlobj.topicid) + "' " ;
				console.log(sqlstr);
				myquery(sqlstr, function (rows) {
					util.log(result.uri + " - " + "update topic hash link" + " - " + urlobj.topicid);
				});
				sqlstr = "UPDATE `" + table_name + "` SET " +
					"`ext_flag_1` = 1 " +
					" WHERE topic_id = 'SC" + escap(urlobj.topicid) + "' " ;
				myquery(sqlstr, function (rows) {
					util.log(result.uri + " - " + "update entry ext_flag_1" + " - " + urlobj.topicid);
				});
				util.log(result.uri + " - " + result.statusCode + " - " + "parsed " + " - " + urlobj.topicid);
			} else {
				util.log(result.uri + " - " + result.statusCode + " - " + "parse failure");
			}
		}
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
			if (addwork() === 0) {
			}
		}
	});
	var addwork = function () {
		var work_id = 5;
		var tmp = function () {
			work_id += 1;
			var sqlstr = '';
			sqlstr = "UPDATE " + table_name + " SET fetch_flag = '"+work_id+"' WHERE fetch_flag = 0 ORDER BY updtime LIMIT 10";
			console.log(sqlstr);
			var res = myqs(sqlstr);
			console.log(res);
			if (isNaN(res)) {
				throw new Error("when get un-fetch records...");
				process.exit();
			}
			if (res > 0) {
				sqlstr = "INSERT INTO gcd_topic_imp_sc (`topic_id`, `hash_type`, `rank`, `title`, " +
					"`author`, `brief`, `pubtime`, `updtime`, " +
					"`res_site`, `res_link`, `abstract`, `res_id`) " +
					"SELECT `topic_id`, 'ed2k', 1, `title`, " +
					"`author`, `brief`, `pubtime`, `updtime`, " +
					"`res_site`, `res_link`, `abstract`, `res_id` " +
					"FROM " + table_name + " WHERE fetch_flag = '" + work_id + "' ";
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
	addwork();
}());
