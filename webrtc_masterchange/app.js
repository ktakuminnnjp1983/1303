
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var Puid = require('puid');

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

function showKeys(hash, sep){
    var num = 0;
    if(!sep){
        sep = "######";
    }
    console.log(sep);
    for(var key in hash){
        ++num;
        console.log("key:%s", hash[key].my_id);
    }
    console.log("num of keys [%d]", num);
    console.log(sep);
}

function changeMasterID(id, socket){
    masterID = id;
    socket.broadcast.emit("masterChanged", id);
}

var puid = new Puid();
var masterID = null;

var connections = {};

function Listeners(){
    this._listeners = {};
}
Listeners.prototype = {
    addListener: function(id, socket){
        this._listeners[id] = socket;
        if(masterID){
            connections[masterID].emit("listenersChanged", this.getIDs());
        }
        this.showListeners();
    },
    removeListener: function(id){
        if(this._listeners[id]){
            delete this._listeners[id];
            if(masterID){
                connections[masterID].emit("listenersChanged", this.getIDs());
            }
            this.showListeners();
        }
    },
    clear: function(){
        this._listeners = {};
        if(masterID){
            connections[masterID].emit("listenersChanged", []);
        }
    },
    getIDs: function(){
        return Object.keys(this._listeners);
    },
    showListeners: function(){
        showKeys(this._listeners, "@@@@@");
    }
};

var listeners = new Listeners();

io.sockets.on('connection', function(socket){
    var id = puid.generate();
    console.log("new connection [%s]", id);
    socket.my_id = id;
    connections[id] = socket;
    showKeys(connections);
    socket.emit("clientConnect", id);
    
    socket.on('getmaster', function(){
        console.log("%s try to get master. currentMaster[%s]", socket.my_id, masterID);
        if(!masterID){
            changeMasterID(socket.my_id, socket);
            socket.emit("getmaster", {result: true, listeners: listeners.getIDs()});
        } else{
            socket.emit("getmaster", {result: false});
        }
    });
    socket.on("releasemaster", function(){
        console.log("%s try to releasemaster", socket.my_id);
        if(masterID != socket.my_id){
            console.log("!!!!!!!!! internal error !!!!!!!!!");
            return ;
        }
        changeMasterID(null, socket);
        // listeners.clear();
    });
    socket.on("getlisten", function(){
        console.log("%s start to listen", socket.my_id);
        // if(!masterID){
            // console.log("master not exists");
            // socket.emit("getlisten", false);
            // return ;
        // }
        socket.emit("getlisten", true);
        listeners.addListener(socket.my_id, socket);
    });
    socket.on("releaselisten", function(){
        console.log("%s end to listen", socket.my_id);
        listeners.removeListener(socket.my_id);
    });
    
    socket.on('disconnect', function(){
        console.log("connection close [%s]", socket.my_id);
        listeners.removeListener(socket.my_id);
        delete connections[socket.my_id];
        if(masterID === socket.my_id){
            changeMasterID(null, socket);
            // listeners.clear();
        }
        showKeys(connections);
    });
});

// for peer server
var portnum = 9000;
var peerServerKey = "peerjs";
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({ port: portnum, key: peerServerKey, debug:3 });

