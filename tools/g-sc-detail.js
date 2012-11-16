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
	var table_name = 'gcd_entry';
	var retry_time = {};
	var groupfetch = {};
	var savefilepath = 'fetched/' + (new Date()).toJSON().substr(0,10) + '-SC/';
	if (!fs.existsSync(savefilepath)) {
		fs.mkdirSync(savefilepath);
	}
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
	var is_group_all = function (tid) {
		if (!groupfetch[tid]) {
			return false;
		}
		var res = true, i, len = groupfetch[tid][0];
		for (i = 1; i <= len; i += 1) {
			if (!groupfetch[tid][i]) {
				res = false;
			}
		}
		return res;
	}
	//var sqlstr = "TRUNCATE TABLE gcd_topic_imp_sc";
	//var tmp = myqs(sqlstr);
	var parsemain = function (error, result) {
		if (error){
			util.log(error);
			return;
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
				if (util.isArray(matchrelated)) {
					var i = 0, len = matchrelated.length, reitem;
					for (i = 0; i < len; i += 1) {
						reitem = regrelated2.exec(matchrelated[i]);
						relatedarr.push({
							"topic_id" : 'SC' + reitem[2].trim(),
							"title" : reitem[1].trim()
						});
					}
				}
				var sqlstr = "UPDATE `gcd_topic_imp_sc` SET " +
					"`main_category` = '" + escap(items[1].trim()) + "', " +
					"`sub_category` = '" + escap(items[2].trim()) + "', " +
					"`content` = '" + escap(items[5].trim()) + "', " +
					"`related` = '" + escap(JSON.stringify(relatedarr)) + "' " +
					" WHERE topic_id = 'SC" + escap(items[4].trim()) + "' " ;
				myquery(sqlstr, function (rows) {
					util.log(result.uri + " - " + "update topic" + " - " + items[4]);
				});
				var filename = savefilepath + 'SC' + items[4].trim() + '.htm'; 
				sqlstr = "UPDATE `" + table_name + "` SET " +
					"`fetch_flag` = 1, " +
					"`res_html` = '" + escap(filename) + "' " +
					" WHERE topic_id = 'SC" + escap(items[4].trim()) + "' " ;
				fs.writeFile(filename, result.body.toString().trim(), function (err) {
					if (err) throw err;
					util.log(result.uri + " - saved file - " + filename);
				});
				myquery(sqlstr, function (rows) {
					util.log(result.uri + " - " + "update entry res_html" + " - " + items[4]);
				});
				var linkarr = [];
				var	groupcount = 0;
				var group = [];
				var matchlink = items[3].match(reglink);
				if (util.isArray(matchlink)) {
					len = matchlink.length;
					for (i = 0; i < len; i += 1) {
						reitem = reglink2.exec(matchlink[i]);
						linkarr.push(reitem[1]);
					}
					if (len > 100) {
						for (i = 0; i < len; i += 100) {
							group.push(linkarr.slice(i,i + 100));
							groupcount += 1;
						}
						groupfetch[items[4]] = [];
						groupfetch[items[4]][0] = groupcount;
						for (i = 1; i <= groupcount; i += 1) {
							c.queue([{
								"uri" : 'http://simplecd.me/download/?seperate=copy&rid=' +
										group[i-1].join('&rid=') + 
										'&topicid=' + items[4] +
										'&groupsi=' + i,
								"callback" : parsehashlink
							}]);
						}
					} else {
						c.queue([{
							"uri" : 'http://simplecd.me/download/?seperate=copy&rid=' + linkarr.join('&rid=') + '&topicid=' + items[4],
							"callback" : parsehashlink
						}]);
					}
				}
				util.log(result.uri + " - " + result.statusCode + " - " + "parsed " + " - " + items[4]);
			} else {
				util.log(result.uri + " - " + result.statusCode + " - " + "parse failure");
			}
		}
	};
	var parsehashlink = function (error, result) {
		if (error){
			util.log(error);
			return;
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
						"title" : item[2].trim(),
						"link" : item[1].trim()
					});
				}
				var urlpart = urltool.parse(result.uri,true);
				var urlobj = urlpart.query;
				var tid = urlobj.topicid.trim();
				if (urlobj.groupsi) {
					var sid = urlobj.groupsi.trim();
					groupfetch[tid][sid] = hasharr;
					if (is_group_all(tid)) {
						hasharr = [];
						len = groupfetch[tid][0];
						for (i = 1; i <= len; i += 1){
							hasharr = hasharr.concat(groupfetch[tid][i]);
						}
					}
				}
				if (!urlobj.groupsi || is_group_all(tid)) {
					var sqlstr = "UPDATE `gcd_topic_imp_sc` SET " +
						"`hash_link` = '" + escap(JSON.stringify(hasharr)) + "' " +
						" WHERE topic_id = 'SC" + escap(tid) + "' " ;
					myquery(sqlstr, function (rows) {
						util.log(result.uri + " - " + "update topic hash link" + " - " + tid);
					});
					sqlstr = "UPDATE `" + table_name + "` SET " +
						"`ext_flag_1` = 1 " +
						" WHERE topic_id = 'SC" + escap(tid) + "' " ;
					myquery(sqlstr, function (rows) {
						util.log(result.uri + " - " + "update entry ext_flag_1" + " - " + tid);
					});
				}
				util.log(result.uri + " - " + result.statusCode + " - " + "parsed " + " - " + tid);
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
				setTimeout(function () {
					util.log("DONE.");
					process.exit();
				},600000);
			}
		}
	});
	var addwork = function () {
		var work_id = 5;
		var tmp = function () {
			work_id += 1;
			var sqlstr = '';
			sqlstr = "UPDATE " + table_name + " SET fetch_flag = '"+work_id+"' WHERE fetch_flag = 0 LIMIT 50";
			var res = myqs(sqlstr);
			if (isNaN(res)) {
				throw new Error("when get un-fetch records...");
				process.exit();
			}
			if (res > 0) {
				sqlstr = "INSERT INTO gcd_topic_imp_sc (`topic_id`, `hash_type`, `rank`, `title`, " +
					"`author`, `brief`, `pubtime`, `updtime`, " +
					"`res_site`, `res_link`, `abstract`, `res_id` ) " +
					"SELECT `topic_id`, 'ed2k', 1, `title`, " +
					"`author`, `brief`, `pubtime`, `updtime`, " +
					"`res_site`, `res_link`, `abstract`, `res_id` " +
					"FROM " + table_name + " WHERE fetch_flag = '" + work_id + "' ";
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
