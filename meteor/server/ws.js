console.log("##### read ws #####");

var WebSocketServer = Meteor.require('websocket').server;
var http = Meteor.require('http');

var httpServer = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

httpServer.listen(3010, function() {
    console.log((new Date()) + ' Server is listening on port 3010');
});
var wsServer = new WebSocketServer({
    httpServer: httpServer,
    maxReceivedFrameSize: 100000000000,
    autoAcceptConnections: false
});

var connections = [];
wsServer.on("request", function(request){
    var connection = request.accept(null, request.origin);
    connections.push(connection);
    console.log(connections.length);
 
    connection.on("message", function(message){
        console.log("########################");
        console.log(this === connection); // true
        console.log(message.type);
        if(message.type == "utf8"){
            console.log(message.utf8Data);
            var json = JSON.parse(message.utf8Data);
            console.log(json.key + ":" + json.val);
            for(var i=0; i<connections.length; ++i){
                if(connections[i] !== connection && json.bloadcast !== false){
                    connections[i].send(message.utf8Data);
                }
            }
        } else if(message.type == "binary"){
            console.log(message.binaryData.constructor);
            console.log(message.binaryData);
            for(var i=0; i<connections.length; ++i){
                if(connections[i] !== connection){
                    connections[i].send(message.binaryData); // Buffer node.js
                }
            }
        }
    });
    connection.on("close", function(reasonCode, description){
        console.log("closed connection");
    });
});
// websocket settings

// peer settings

var PeerServer = Meteor.require("peer").PeerServer;
var pServer = new PeerServer({port: 9000, debug: 3});



