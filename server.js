var express = require("express");
var bodyParser = require("body-parser");
var path = require('path');
var multer = require('multer');
var routes = require('./routes');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var staticHost = "s2.51ping.com";
console.log(staticHost);

// 设置模板引擎
app.set('view engine', 'jade');
// 设置模板存放目录
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/static'));
// 预览
app.use('/preview',express.static(path.join(__dirname, '..', 'dest')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer());

app.get('/', routes.home);
app.get('/trash', routes.home);

app.get('/create', routes.create);

app.post('/generate', routes.generate(io));
app.get('/remove/:cityName', routes.remove);
app.get('/destory/:cityName', routes.destory);
app.get('/download/:cityName', routes.download);
app.get('/reset/:cityName', routes.reset);

var port = process.env.PORT || 3005;

server.listen(port,function(){
  console.log("started at",port);
});