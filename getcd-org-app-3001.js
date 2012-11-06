(function () {
	var cfg = require('./config.js');
	//var gquery = require('./gcd-query.js');
	var actions = require('./gcd-action.js');
	
	var express = require('express');
	var app = module.exports = express.createServer();
	var tenjin = require('tenjin');
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
		app.listen(cfg.listenport);
		console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
	}catch(e){
		console.log("Error: "+e.message);
	}
	
}());
