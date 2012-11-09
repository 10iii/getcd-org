(function () {
	var cfg = require('./config.js');
	var redis = require("redis");
	var redclient = redis.createClient();
	redclient.on("error", function (err) {
		console.log("Redis connection error to " + redclient.host + ":" + redclient.port + " - " + err);
	});
	redclient.select(cfg.redisdb);
	var	util = require('util'),
		mysql = require('mysql-libmysqlclient'),
		conn,
		result;
		
	conn = mysql.createConnectionSync();
	conn.connectSync(cfg.host, cfg.user, cfg.password, cfg.database);
	
	if (!conn.connectedSync()) {
	  util.puts("Connection error " + conn.connectErrno + ": " + conn.connectError);
	  process.exit(1);
	};
	conn.realQuerySync("SET NAMES utf8;");
	result = conn.storeResultSync();
	
	var gquery = {
		escapes : function (raw) {
			if (typeof(raw) === "undefined") {
				return '';
			} else{
				return conn.escapeSync(raw);
			}
		},
		gqs : function (sqlstr) {
			conn.realQuerySync(sqlstr);
			var res = conn.storeResultSync();
			if (res.numRowsSync) {
				return res;
			} else {
				return conn.affectedRowsSync();
			}
		},
		gq : function (sqlstr, callb, expired) {
			if (expired !== undefined && expired > 0){
				var redkey = "myquery:" + encodeURI(sqlstr);
				redclient.get(redkey, function(err,res){
					if (err) {
						console.log("get redis error:"+err);
					} else {
						if (res) {
							//console.log("redis get:"+redkey);
							callb(JSON.parse(res));
						} else {
							conn.query(sqlstr, function (err, sqlres) {
								if (err) {
									throw err;
								}	  
								if (sqlres.numRowsSync) {
									sqlres.fetchAll(function (err, rows) {
										if (err) {
											throw err;
										}
										redclient.setex(redkey,  expired, JSON.stringify(rows));
										//console.log("redis set:"+redkey);
										callb(rows);
									});
								} else {
									callb(conn.affectedRowsSync());
								}
							});
						} //else //if(res)
					} //else   //if(err){
				});
			} else { //if(expired !== undefined && expired > 0){
				conn.query(sqlstr, function (err, sqlres) {
					if (err) {
						throw err;
					}	  
					if (sqlres.numRowsSync) {
						sqlres.fetchAll(function (err, rows) {
							if (err) {
								throw err;
							}
							callb(rows);
						});
					} else {
						callb(conn.affectedRowsSync());
					}
				});
			} //}else{ //if(expired !== undefined || expired > 0){
		}
	};
	module.exports = gquery;
}());


