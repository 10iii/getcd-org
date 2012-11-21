(function () {
	var cfg = require('./config.js');
	//var gquery = require('./gcd-query.js');
	var actions = require('./gcd-action.js');
	/**
	 * Module dependencies.
	 */

	var express = require('express')
//	, routes = require('./routes')
//	, user = require('./routes/user')
	, http = require('http')
	, path = require('path');

	var tenjin = require('tenjin');
	var app = express();

	app.configure(function(){
		app.set('port', process.env.PORT || cfg.listenport);
		app.set('views', __dirname + '/views');
		//app.set('view engine', 'ejs');
		app.set("view engine", "html");
		app.engine('html', tenjin.renderFile);
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser('your secret here'));
		app.use(express.session());
		app.use(express.static(path.join(__dirname, 'public')));
		app.use(app.router);
	});

	app.configure('development', function(){
		app.use(express.errorHandler());
	});

	// Routes
	for (ind in actions){
		app.get(ind,actions[ind]);
	}
	//app.get('/', routes.index);
	//app.get('/users', user.list);

	app.get('/*',function(req, res){
		res.render('404',{
			status: 404,
			title:'404 - OOM!! YOU GET LOST!'
		});
	});
	http.createServer(app).listen(app.get('port'), function(){
		console.log("Express server listening on port " + app.get('port'));
	});
}());
