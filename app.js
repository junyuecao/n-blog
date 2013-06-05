/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var domain = require('domain');



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('env', settings.env);
//引入一个domain的中间件，将每一个请求都包裹在一个独立的domain中
//domain来处理异常
app.use(function(req, res, next) {
  var d = domain.create();
  //监听domain的错误事件
  d.on('error', function(err) {

    res.statusCode = 500;
    res.json({
      sucess: false,
      messag: '服务器异常'
    });
    d.dispose();
  });

  d.add(req);
  d.add(res);
  d.run(next);
});
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(expressValidator);
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30
  }, //30days
  store: new MongoStore({
    db: settings.db.name
  })
}));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.use(function(err, req, res, next) {
  console.log(err.stack);
  res.send("Error");
});

// development only
console.log(app.get('env'));
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//业务路由
routes(app);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});