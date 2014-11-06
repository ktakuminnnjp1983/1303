
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var WebSocketServer = require('websocket').server;
var fs = require("fs");

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

var cookiePaarser = require("cookie-parser");
var session = require("express-session");

app.use(cookiePaarser("test_secret"));
app.use(session({key: "test_sess"}));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


var httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var wsServer = new WebSocketServer({
    httpServer: httpServer,
    maxReceivedFrameSize: 100000000000,
    autoAcceptConnections: false
});

var connections = [];
wsServer.on("request", function(request){
    for(var prop in request){
        if(typeof request[prop] != "function"){
            console.log(prop + " " + request[prop]);
        }
    }
    var connection = request.accept(null, request.origin);
    connections.push(connection);
    console.log(connections.length);
 
    connection.on("message", function(message){
        console.log(message.constructor);
        console.log(message.type);
        console.log("########################");
        if(message.type == "utf8"){
            console.log(message.utf8Data.length);
            var buf = new Buffer(message.utf8Data.length);
            for(var i=0; i<buf.length; ++i){
                buf[i] = message.utf8Data[i].charCodeAt(0);
            }
            var fd = fs.openSync("./img.png", "w");
            fs.write(fd, buf, 0, buf.length, 0, function(err, written){
            });

            for(var i=0; i<connections.length; ++i){
                connections[i].send(message.utf8Data);
            }
        } else if(message.type == "binary"){
            console.log(message.binaryData);
            for(var i=0; i<connections.length; ++i){
                connections[i].send(message.binaryData); // Buffer node.js
            }
            
            var fd = fs.openSync("./img.png", "w");
            fs.write(fd, message.binaryData, 0, message.binaryData.length, 0, function(err, written){
            });
        }
    });
    connection.on("close", function(reasonCode, description){
    });
});
