
/**
 * Module dependencies.
 */

var PAGEITEMNUMBER = 20;
var DBCACHESECOND = 20;

var express = require('express');
var app = module.exports = express.createServer();
//var tenjin = require('./nTenjin.js');
var tenjin = require('tenjin');

var redis = require("redis"),
    redclient = redis.createClient();

redclient.on("error", function (err) {
    console.log("Redis connection error to " + client.host + ":" + client.port + " - " + err);
});

redclient.select(5);

//var sqlite = require('./sqlite');
//var db = sqlite.openDatabaseSync("./verycd.sqlite3.db");

var
  sys = require('sys'),
  mysql = require('mysql-libmysqlclient'),
  conn,
  conn2,
  result,
  row,
  rows;

/**
 * Set database connection settings
 */
var
  host = "127.0.0.1",
  user = "cidbuser",
  password = "d20101111",
  database = "getcd",
  test_table = "verycd";
  
  var
  host2 = "127.0.0.1",
  user2 = "indexuser",
  password2 = "1109atindex",
  database2 = "getcdindex",
  test_table2 = "verycd",
  port2 = 3316;
  /*
var
  host = "127.0.0.1",
  user = "getcddb",
  password = "getat1106",
  database = "getcd",
  test_table = "verycd";

  var
  host2 = "127.0.0.1",
  user2 = "indexuser",
  password2 = "1109atindex",
  database2 = "getcdindex",
  test_table2 = "verycd",
  port2 = 3316;
*/


/**
 * Create connection
 */
conn = mysql.createConnectionSync();
conn.connectSync(host, user, password, database);

conn2 = mysql.createConnectionSync();
conn2.connectSync(host2, user2, password2, database2, port2);

/**
 * Check connection status
 */
if (!conn.connectedSync()) {
  sys.puts("Connection error " + conn.connectErrno + ": " + conn.connectError);
  process.exit(1);
}

if (!conn2.connectedSync()) {
  sys.puts("Connection error " + conn2.connectErrno + ": " + conn2.connectError);
  process.exit(1);
}
//result = conn.querySync(" SET NAMES utf8 ; ");
//sys.puts("Information:");
//sys.puts(sys.inspect(conn.getInfoSync()) + "\n");

conn.realQuerySync("SET NAMES utf8;");
result = conn.storeResultSync();

conn2.realQuerySync("SET NAMES utf8;");
result = conn2.storeResultSync();

function myquery(sqlstr, callb, expired){
	if(expired !== undefined && expired > 0){
		var redkey = "myquery:"+encodeURI(sqlstr);
		redclient.get(redkey, function(err,res){
			if(err){
				console.log("get redis error:"+err);
			}else{
				if(res){
					//console.log("redis get:"+redkey);
					callb(JSON.parse(res));
				}else{
					conn.query(sqlstr, function (err, sqlres) {
						if (err) {
							throw err;
						}	  
						sqlres.fetchAll(function (err, rows) {
							if (err) {
								throw err;
							}
							redclient.setex(redkey,  expired, JSON.stringify(rows));
							//console.log("redis set:"+redkey);
							callb(rows);
						});
					});
				}//else //if(res)
			} //else   //if(err){
		});
	}else{ //if(expired !== undefined && expired > 0){
		conn.query(sqlstr, function (err, sqlres) {
			if (err) {
				throw err;
			}	  
			sqlres.fetchAll(function (err, rows) {
				if (err) {
					throw err;
				}
				callb(rows);
			});
		});
	} //}else{ //if(expired !== undefined || expired > 0){
}

function myquery2(sqlstr,callb){
	var expired = 200;
	var redkey = "myquery2:"+encodeURI(sqlstr);
	redclient.get(redkey, function(err,res){
		if(err){
			console.log("get redis error:"+err);
		}else{
			if(res){
				//console.log("redis get:"+redkey);
				callb(JSON.parse(res));
			}else{
				conn2.query(sqlstr, function (err, sqlres) {
					if (err) {
						throw err;
					}	  
					sqlres.fetchAll(function (err, rows) {
						if (err) {
							throw err;
						}
						redclient.setex(redkey,  expired, JSON.stringify(rows));
						//console.log("redis set:"+redkey);
						callb(rows);
					});
				});
			}//else //if(res)
		} //else   //if(err){
	});
}



actions = {
	
	"/":	
	function(req, res){
		res.header('Vary', 'User-Agent');
		res.header('Cache-Control', 'private');
		res.redirect('/index.1');
	},
	
	"/2":	
	function(req, res){
		res.render('index', {
			title: 'Express'
		})
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
		
		var countsqlstr = "SELECT sum(count) AS itemcount FROM cate_count WHERE category1 = '"+strcate1+"' "
			+(strcate2?" AND category2 = '"+strcate2+"' ":" ")
			+";";
		myquery(countsqlstr, function (rows) {
			var itemcount = parseInt(rows[0]["itemcount"]);
			if ((itemcount == 0)||(PAGEITEMNUMBER*(strpage-1) >= itemcount)|| (strpage<1) ){
				res.render('category',{
					starttime:start_time,
					title: strcate1 + (strcate2 ? '/'+strcate2 : ''),
					category1: [strcate1],
					category2: [strcate2],
					pagecount: [strpage],
					totalpage: [1],
					itrows: []
				});
			}else{ //if (itemcount == 0)
				var sqlstr="";
				sqlstr = "SELECT * FROM verycd USE INDEX ("
					+(strcate2?"idx_del_c1_c2_upd":"idx_del_c1_upd")
					+") WHERE del_flag = 0 AND category1 = '"+strcate1+"' "
					+(strcate2?" AND category2 = '"+strcate2+"' ":" ")
					+" ORDER BY updtime DESC LIMIT "+PAGEITEMNUMBER
					+(strpage? " OFFSET "+(PAGEITEMNUMBER*(strpage-1)) : " ")
					+";";
				myquery(sqlstr, function (rows){
					res.render('category',{
						starttime:start_time,
						title: strcate1 + (strcate2 ? '/'+strcate2 : ''),
						category1: [strcate1],
						category2: [strcate2],
						pagecount: [strpage],
						totalpage: [Math.ceil(itemcount/PAGEITEMNUMBER)],
						itrows: rows
					});
				}, DBCACHESECOND); //myquery(sqlstr, function (rows){
			} //if (itemcount == 0)
		}, DBCACHESECOND); //myquery(countsqlstr, function (rows) {
	}, //function(req, res){
	
	"/search/:searchfor.:page([0-9]+)?":	
	function(req, res){
		var start_time = Date.now();
		var strsearch=(typeof(req.params.searchfor)=="string"?req.params.searchfor.replace(/[\/\-\\]/g,"").substring(0,50):void(0));
		var strpage=(typeof(req.params.page)=="string"?parseInt(req.params.page):1);
		
		var countsqlstr = "SELECT verycdid FROM verycd WHERE MATCH(title) AGAINST ('"+strsearch+"')  LIMIT "+PAGEITEMNUMBER
					+(strpage? " OFFSET "+(PAGEITEMNUMBER*(strpage-1)) : " ") + ";";
		myquery2(countsqlstr,function (rows) {
			if(rows.length ==0){
				res.render('search',{
					starttime: start_time,
					title: "SEARCH - "+strsearch,
					searchfor: strsearch,
					pagecount: [strpage],
					totalpage: [1],
					itrows: []
				});
			}else{ //if(rows.length ==0){
				var verycdids = [];
				var rangestr = "";
				for (ind in rows){
					verycdids.push(rows[ind]["verycdid"]);
				}
				rangestr = "'"+verycdids.join("','")+"'";
				//res.send(rangestr);
				var sqlstr = "SELECT * FROM verycd WHERE del_flag = 0 AND  verycdid IN ("+rangestr+") ; ";
				myquery(sqlstr, function (rows){
					res.render('search',{
						starttime: start_time,
						title: "SEARCH - "+strsearch,
						searchfor: strsearch,
						pagecount: [strpage],
						totalpage: [strpage+2],
						itrows: rows
					});
				}, DBCACHESECOND); //myquery(sqlstr, function (rows){
			}// else{ //if(rows.length ==0){
		});
	}, //function(req, res){
	
	
	"/index.:page([0-9]+)?":	
	
	function(req, res){
		var start_time = Date.now();
		var strpage=(typeof(req.params.page)=="string"?parseInt(req.params.page):1);
		
		var countsqlstr = "SELECT count(*) AS itemcount FROM verycd WHERE del_flag = 0 ;";
		myquery(countsqlstr, function (rows) {
			var itemcount = parseInt(rows[0]["itemcount"]);
			if ((itemcount == 0)||(PAGEITEMNUMBER*(strpage-1) >= itemcount)|| (strpage<1) ){
				res.render('index',{
					starttime: start_time,
					title: '首页',
					pagecount: [strpage],
					totalpage: [1],
					itrows: []
				});
			}else{ //if (itemcount == 0)
				var sqlstr="";
				sqlstr = "SELECT * FROM verycd WHERE del_flag = 0 ORDER BY updtime DESC LIMIT "+PAGEITEMNUMBER
					+(strpage? " OFFSET "+(PAGEITEMNUMBER*(strpage-1)) : " ")
					+";";
				myquery(sqlstr, function (rows){
					res.render('index',{
						starttime: start_time,
						title:  '首页',
						pagecount: [strpage],
						totalpage: [Math.ceil(itemcount/PAGEITEMNUMBER)],
						itrows: rows
					});
				}, DBCACHESECOND) //myquery(sqlstr, function (rows){
			} //if (itemcount == 0)
		}, DBCACHESECOND); //myquery(countsqlstr, function (rows) {
	}, //function(req, res){
	
	
	"/topic/:id([0-9]+)":	//function(req, res){res.render('topic', rowsample)},
	
	function(req, res){
		var start_time = Date.now();
		myquery("SELECT * FROM verycd WHERE del_flag = 0 AND verycdid = '"+req.params.id+"'; "
			, function (rows) {
				if (rows.length == 1){
					rows[0]["starttime"] = start_time;
					res.render('topic',rows[0]);
					//res.json(rows[0]);
				}else{
					res.redirect('/404');
				}
			}, DBCACHESECOND) //myquery("SELECT * FROM verycd WHERE del_flag = 0 AND verycdid = '"+req.params.id+"'; "
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

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  app.set("view engine", "html");
  app.set('view cache', true);
  app.register(".html", tenjin);
  //app.set('view options', {layout: false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));// change the order for using 404 page
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
for (ind in actions){
	app.get(ind,actions[ind]);
}

/*
app.get('/',actions["/"]);
app.get('/2',actions["/2"]);
app.get('/test',actions["/test"]);

app.get('/search/:searchfor.:page([0-9]+)?',actions["/search/:searchfor.:page([0-9]+)?"]);
app.get('/index.:page([0-9]+)?',actions["/index.:page([0-9]+)?"]);
app.get('/topic/:id([0-9]+)',actions["/topic/:id([0-9]+)"]);
app.get('/category/:cate1/:cate2?.:page([0-9]+)?',actions["/category/:cate1/:cate2?.:page([0-9]+)?"]);
app.get('/topicthumb/:topicid/:width/:height',actions["/topicthumb/:topicid/:width/:height"]);
app.get('/*',actions["/*"]);
*/

app.get('/*',function(req, res){
	res.render('404',{
		status: 404,
		title:'404 - OOM!! YOU GET LOST!'
	})
});

try{
	app.listen(3001);
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}catch(e){
	console.log("Error: "+e.message);
}
