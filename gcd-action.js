(function () {
	var gquery =require('./gcd-query.js');
	var myquery = gquery.gq;
	var escap = gquery.escapes;
	var cfg = require('./config.js');
	var gcddiv = require('./gcd-div.js');
	var wordseg = require('./searchseg.node');
	wordseg.init("");
	module.exports = {
		"/":	
		function(req, res){
			res.header('Vary', 'User-Agent');
			res.header('Cache-Control', 'private');
			res.redirect('/index.1');
		},
		
		"/2":	
		function(req, res){
			res.render('test', {
				title: 'Express',
				testid: 123
			})
		},
		"/st/:searchfor.:page([0-9]+)?":	
		function(req, res){
			var start_time = Date.now();
			var strsearch=(typeof(req.params.searchfor)=="string"?req.params.searchfor.replace(/[\/\-\\]/g,"").substring(0,50):void(0));
			var strpage=(typeof(req.params.page)=="string"?parseInt(req.params.page):1);
			rl.question(strsearch+"\n", function(strseg){
				res.render('test', {
					title: strseg,
					testid: 123
				});
			});
		},
		
		"/test":	
		function(req, res){
			res.redirect("http://www.google.com/images/srpr/logo3w.png");
		/*
			res.render('index', {
				title: 'Express'
			})
			*/
		},
		"/topicthumb/:topicid/:width/:height":
		function(req, res){
			res.redirect("http://www.google.com/images/srpr/logo3w.png");
		},
		
		"/category/:cate1/:cate2?.:page([0-9]+)?":
		function(req, res){
			var start_time = Date.now();
			var strcate1=(typeof(req.params.cate1)=="string"?req.params.cate1.replace(/[\/\-\\]/g,"").substring(0,20):void(0));
			var strcate2=(typeof(req.params.cate2)=="string"?req.params.cate2.replace(/[\/\-\\]/g,"").substring(0,20):void(0));
			var strpage=(typeof(req.params.page)=="string"?parseInt(req.params.page):1);
			if (strpage > cfg.MAXPAGENUMBER) {
				res.redirect("/404");
				return;
			}
			var sqlstr="";
			sqlstr = "SELECT * FROM gcd_topic USE INDEX ("
				+(strcate2?"ind_rank_main_sub_upd":"ind_rank_main_upd")
				+") WHERE rank = 1 AND main_category = '"+strcate1+"' "
				+(strcate2?" AND sub_category = '"+strcate2+"' ":" ")
				+" ORDER BY updtime DESC LIMIT "+cfg.PAGEITEMNUMBER
				+(strpage? " OFFSET "+(cfg.PAGEITEMNUMBER*(strpage-1)) : " ")
				+";";
			myquery(sqlstr, function (rows){
				var hasresult = rows.length > 0;
				res.render('category',{
					starttime:start_time,
					title: strcate1 + (strcate2 ? '/'+strcate2 : ''),
					main_category: [strcate1],
					sub_category: [strcate2],
					div: gcddiv,
					pagecount: [strpage],
					totalpage: hasresult ? [cfg.MAXPAGENUMBER] : [1], //[Math.ceil(itemcount/cfg.PAGEITEMNUMBER)],
					itrows: hasresult ? rows : []
				});
			}, cfg.DBCACHESECOND); //myquery(sqlstr, function (rows){
		}, //function(req, res){
		
		"/search/:searchfor.:page([0-9]+)?":	
		function(req, res){
			var start_time = Date.now();
			var strsearch=(typeof(req.params.searchfor)=="string"?req.params.searchfor.replace(/[\/\-\\]/g,"").substring(0,80):void(0));
			var strpage=(typeof(req.params.page)=="string"?parseInt(req.params.page):1);
			if (strpage > cfg.MAXPAGENUMBER) {
				res.redirect("/404");
				return;
			}
			wordseg.segment(strsearch, function(strseg){
				var countsqlstr = "SELECT topic_id FROM gcd_search WHERE rank = 1 AND MATCH(title) AGAINST ('"
							+escap(strseg.trim())+"')  LIMIT "+cfg.PAGEITEMNUMBER
							+(strpage? " OFFSET "+(cfg.PAGEITEMNUMBER*(strpage-1)) : " ") + ";";
				myquery(countsqlstr,function (rows) {
					if(rows.length ==0){
						res.render('search',{
							starttime: start_time,
							title: "SEARCH - "+strsearch,
							searchfor: strsearch,
							pagecount: [strpage],
							totalpage: [1],
							div: gcddiv,
							itrows: []
						});
					}else{ //if(rows.length ==0){
						var topic_ids = [];
						var rangestr = "";
						for (ind in rows){
							topic_ids.push(rows[ind]["topic_id"]);
						}
						rangestr = "'"+topic_ids.join("','")+"'";
						//res.send(rangestr);
						var sqlstr = "SELECT * FROM gcd_topic WHERE topic_id IN ("+rangestr+") ; ";
						myquery(sqlstr, function (rows){
							res.render('search',{
								starttime: start_time,
								title: "SEARCH - "+strsearch,
								searchfor: strsearch,
								pagecount: [strpage],
								div: gcddiv,
								totalpage: [strpage+2],
								itrows: rows
							});
						}, cfg.DBCACHESECOND); //myquery(sqlstr, function (rows){
					}// else{ //if(rows.length ==0){
				});
			});
		}, //function(req, res){
		
		
		"/index.:page([0-9]+)?":
		function (req, res) {
			var start_time = Date.now();
			var strpage=(typeof(req.params.page)=="string"?parseInt(req.params.page):1);
			if (strpage > cfg.MAXPAGENUMBER) {
				res.redirect("/404");
				return;
			}
			var sqlstr="";
			sqlstr = "SELECT * FROM gcd_topic WHERE rank = 1 ORDER BY updtime DESC LIMIT "+cfg.PAGEITEMNUMBER
				+(strpage? " OFFSET "+(cfg.PAGEITEMNUMBER*(strpage-1)) : " ")
				+";";
			myquery(sqlstr, function (rows){
				var hasresult = rows.length > 0;
				res.render('index',{
					starttime: start_time,
					title: '把CD排排好!',
					div: gcddiv,
					pagecount: [strpage],
					totalpage: hasresult? [cfg.MAXPAGENUMBER] : [1], //[Math.ceil(itemcount/cfg.PAGEITEMNUMBER)],
					itrows: hasresult? rows : []
				});
			}, cfg.DBCACHESECOND) //myquery(sqlstr, function (rows){
		}, //function(req, res){
		
		
		"/topic/:id([a-zA-Z0-9]+)":	//function(req, res){res.render('topic', rowsample)},
		function(req, res){
			var start_time = Date.now();
			myquery("SELECT * FROM gcd_topic WHERE rank = 1 AND topic_id = '"+req.params.id+"'; "
				, function (rows) {
					if (rows.length == 1){
						rows[0]["starttime"] = start_time;
						res.render('topic',rows[0]);
						//res.json(rows[0]);
					}else{
						res.redirect('/404');
					}
				}, cfg.DBCACHESECOND) //myquery("SELECT * FROM verycd WHERE del_flag = 0 AND verycdid = '"+req.params.id+"'; "
		},
		
		/*
		"/*":
		function(req, res){
			res.render('404',{
				status: 404,
				title:'404 - OOM!! YOU GET LOST!'
			})
		},
		*/
	};
}());
