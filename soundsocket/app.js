
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

var fs = require("fs");

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
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

function writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
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
            if(message.utf8Data == "getFile"){
                var b = new Buffer();
                fs.read("./test.txt", "binary", function(err, data){
                    var interleaved = data;
                    var sampleRate = 22050 
                    // create our wav file
                    var buffer = new ArrayBuffer(44 + interleaved.length * 2);

                    var view = new DataView(buffer);

                    // RIFF chunk descriptor/identifier 
                    writeUTFBytes(view, 0, 'RIFF');

                    // file length 
                    // view.setUint32(4, 44 + interleaved.length * 2, true);
                    view.setUint32(4, 8 + interleaved.length * 2, true);

                    // RIFF type 
                    writeUTFBytes(view, 8, 'WAVE');

                    // format chunk identifier 
                    // FMT sub-chunk
                    writeUTFBytes(view, 12, 'fmt ');

                    // format chunk length 
                    view.setUint32(16, 16, true);

                    // sample format (raw)
                    view.setUint16(20, 1, true);

                    // stereo (2 channels)
                    view.setUint16(22, 2, true);

                    // sample rate 
                    view.setUint32(24, sampleRate, true);

                    // byte rate (sample rate * block align) 
                    view.setUint32(28, sampleRate * 4, true);

                    // block align (channel count * bytes per sample) 
                    view.setUint16(32, 4, true);

                    // bits per sample 
                    view.setUint16(34, 16, true);

                    // data sub-chunk
                    // data chunk identifier 
                    writeUTFBytes(view, 36, 'data');

                    // data chunk length 
                    view.setUint32(40, interleaved.length * 2, true);

                    // write the PCM samples
                    var lng = interleaved.length;

                    var index = 44;
                    volume = 1;

                    for (var i = 0; i < lng; i++) {
                        // dataView.setInt16(byteOffset, value, littleEndian); 

                        // The literals 0x7FFF and 32767 are identical to the compiler in every way.
                        // The maximum that it can hold (signed, positive) is 0x7FFFFFFF.
                        // 32767 is the positive signed max for 16 bits
                        // each base 16 digit occupies exactly 4 bits
                        view.setInt16(index, interleaved[i] * (32767 * volume), true);

                        index += 2;
                    }

                    // final binary blob
                    console.log(view.byteLength);
                    console.log(view.buffer.length);
                    console.log(view.buffer);
                    console.log(buffer.length);
                    fs.open("./test.wav", "w", function(err, fd){
                        fs.writeSync(fd, buffer, 0, buffer.length, 0);
                        console.log("audio writeEnd");
                    });
                });
            }
        } else if(message.type == "binary"){
            console.log(message.binaryData.constructor);
            console.log(message.binaryData);
            fs.appendFile("./test.txt", message.binaryData, "binary", {flag: "a"});
            // for(var prop in connections){
            // if(connection !== connections[prop]){
            // connections[prop].send(message.binaryData); // Buffer node.js
            // console.log("send");
            // }
            // }
        }
    });
    connection.on("close", function(reasonCode, description){
        console.log("closed connection %s", connection.my_id);
        delete connections[connection.my_id];
        showConnections();
    });
});
