
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var Puid = require('puid');
var WebSocketServer = require('websocket').server;

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
app.get('/users', user.list);


var httpServer = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var wsServer = new WebSocketServer({
    httpServer: httpServer,
    maxReceivedFrameSize: 100000000000,
    autoAcceptConnections: false
});

function showConnections(){
    var i = 0;
    for(var id in connections){
        console.log(i + " connectionid:" + id);
        ++i;
    }
    console.log("num of connections %d", i);
}

var puid = new Puid();
var connections = {}; 
wsServer.on("request", function(request){
    var id = puid.generate();
    console.log("connect:" + id);
    var connection = request.accept(null, request.origin);
    connection.my_id = id;
    connections[id] = connection;
    showConnections();
 
    connection.on("message", function(message){
        console.log("########################");
        console.log(this === connection); // true
        console.log(message.type);
        if(message.type == "utf8"){
            console.log(message.utf8Data);
        } else if(message.type == "binary"){
            console.log(message.binaryData.constructor);
            console.log(message.binaryData);
            for(var prop in connections){
                if(connection !== connections[prop]){
                    connections[prop].send(message.binaryData); // Buffer node.js
                }
            }
        }
    });
    connection.on("close", function(reasonCode, description){
        console.log("closed connection %s", connection.my_id);
        delete connections[connection.my_id];
        showConnections();
    });
});
