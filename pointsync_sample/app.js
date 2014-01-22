
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var httpServer = http.createServer(app);
var io = require("socket.io").listen(httpServer);

httpServer.listen(app.get("port"));

var g_x, g_y;
io.sockets.on('connection', function(socket){
	console.log("SSSSSS " + "init x:" + g_x + ", y:" + g_y);
	socket.emit("connectionOK");
	if(g_x != undefined && g_y != undefined){
		console.log("SSSSSS " + "init x:" + g_x + ", y:" + g_y);
	    socket.emit("syncPoint", {x : g_x, y : g_y});
	}
    
    socket.on("mouseMove", function(msg){
    	console.log("SSSSSS " + "x:" + msg.x + ", y:" + msg.y);
    	socket.broadcast.emit("syncPoint", { x: msg.x, y: msg.y });
    	g_x = msg.x;
    	g_y = msg.y;
    });
    socket.on("binaryFile", function(file){
    	console.log("SSSSSS " + file.val.constructor);
        socket.broadcast.emit("fileBroadcast", {val: file.val});
    });
});
