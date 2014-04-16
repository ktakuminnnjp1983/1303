
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
var io = require("socket.io").listen(httpServer, {"log level": 1});

httpServer.listen(app.get("port"));

function showKeys(hash, sep){
    var num = 0;
    if(!sep){
        sep = "######";
    }
    
    console.log(sep);
    for(var key in hash){
        ++num;
        console.log("key:%s", key);
    }
    console.log("num of keys [%d]", num);
    console.log(sep);

    return num;
}

function ConnectionMgr(roomName){
    this._roomName = roomName
    this._connections = {};
    this._listeners = {};
    this._masters = {};
    this._masterCount = 0;
}
ConnectionMgr.prototype = {
    addConnection: function(id, socket){
        console.log("new connection [%s]", id);
        this._connections[id] = socket;
        io.sockets.to(this._roomName).emit("numConnectionChanged", this.showConnections());
    },
    removeConnection: function(id){
        if(!this._connections[id]){
            console.log("!!!!!!!!! internal error0 !!!!!!!!!");
            return ;
        }
        console.log("remove connection [%s]", id);
        this.removeMaster(id);
        this.removeListener(id);
        delete this._connections[id];
        io.sockets.to(this._roomName).emit("numConnectionChanged", this.showConnections());
    },
    addMaster: function(id, socket){
        console.log("try to add master [%s]", id);
        if(this._masterCount >= 3){
            console.log("num of master full");
            socket.emit("getmaster", {result: false, listeners: []});
            // this.broadcast(socket.id, "wantMaster", socket.id);
            socket.broadcast.to(this._roomName).emit("wantMaster", socket.id);
            return ;
        }
        ++this._masterCount;
        console.log("new master [%s], num[%d]", id, this._masterCount);
        this._masters[id] = socket;
        socket.emit("getmaster", {result: true, listeners: this.getListenerIDs()});
        this.showMasters();
    },
    removeMaster: function(id){
        if(!this._masters[id]){
            return ;
        }
        --this._masterCount;
        console.log("remove master [%s] num[%d]", id, this._masterCount);
        delete this._masters[id];
        this.showMasters();
    },
    addListener: function(id, socket){
        console.log("new listener [%s]", id);
        this._listeners[id] = socket;
        for(var id in this._masters){
            this._masters[id].emit("listenersChanged", this.getListenerIDs());
        }
        this.showListeners();
        socket.emit("getlisten", true);
    },
    removeListener: function(id){
        if(!this._listeners[id]){
            return ;
        }
        console.log("remove listener [%s]", id);
        delete this._listeners[id];
        for(var id in this._masters){
            this._masters[id].emit("listenersChanged", this.getListenerIDs());
        }
        this.showListeners();
    },
    broadcast: function(myid, key, data){
        for(var id in this._connections){
            console.log("broadcast to [%s]->[%s]", myid, id);
            if(id !== myid){
                this._connections[id].emit(key, data);
            }
        }
    },
    getListenerIDs: function(){
        return Object.keys(this._listeners);
    },
    showConnections: function(){
        return showKeys(this._connections, "CCCCC");
    },
    showListeners: function(){
        return showKeys(this._listeners, "LLLLL");
    },
    showMasters: function(){
        return showKeys(this._masters, "MMMMM");
    },
};

var g_connectionMgrHash = {};

io.sockets.on('connection', function(socket){
    socket.emit("clientConnect", socket.id);
    
    socket.on("enterRoom", function(roomName){
        console.log("[%s] enter [%s]", socket.id, roomName);
        if(!roomName){
            return ;
        }
        socket.join(roomName);
        socket.my_roomName = roomName
        if(!g_connectionMgrHash[roomName]){
            console.log("new Room [%s] created", roomName);
            g_connectionMgrHash[roomName] = new ConnectionMgr(roomName);
        }
        g_connectionMgrHash[roomName].addConnection(socket.id, socket);
    });
    
    socket.on('getmaster', function(){
        g_connectionMgrHash[socket.my_roomName].addMaster(socket.id, socket);
    });
    socket.on("releasemaster", function(){
        g_connectionMgrHash[socket.my_roomName].removeMaster(socket.id);
    });
    socket.on("getlisten", function(){
        g_connectionMgrHash[socket.my_roomName].addListener(socket.id, socket);
    });
    socket.on("releaselisten", function(){
        g_connectionMgrHash[socket.my_roomName].removeListener(socket.id);
    });
    
    socket.on('disconnect', function(){
        console.log("connection closed id[%s] room[%s]", socket.id, socket.my_roomName);
        if(!socket.my_roomName){
            return ;
        }
        g_connectionMgrHash[socket.my_roomName].removeConnection(socket.id);
    });
});

// for peer server
var portnum = 9000;
var peerServerKey = "peerjs";
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({ port: portnum, key: peerServerKey, debug:3 });

