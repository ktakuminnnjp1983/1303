console.log("Read server");

// websocket settings
// http://d.hatena.ne.jp/nextliteracy/20131203/1386033577
// npm install -g meteorite
// mrt add npm
// mrt
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


Meteor.startup(function () {
    console.log("Server startup");
    
    Meteor.publish("watchers", function(){
        return Watchers.find();
    });
    Meteor.publish("masterSlideNo", function(){
        return MasterSlideNo.find();
    });
    Meteor.publish("opinions", function(){
        return Opinions.find();
    });
    Meteor.publish("comments", function(){
        return Comments.find();
    });
    Meteor.publish("slideImgs", function(){
        return SlideImgs.find();
    });

    Watchers.allow({
        // データの挿入を許可するか
        insert: function(userId, doc) {
            return true;
        },
        // データの更新を許可するか
        update: function(userId, docs, fields, modifier) {
            return true;

        },
        // データの削除を許可するか
        remove: function(userId, docs) {
            return true;
        },
        // クライアントに公開するプロパティを，文字列配列で指定する
        // 全て公開する場合はundefined（もしくは指定しない）
        fetch: undefined
    });
    MasterSlideNo.allow({
        insert: function(userId, doc) {
            return true;
        },
        update: function(userId, docs, fields, modifier) {
            return true;

        },
        remove: function(userId, docs) {
            return true;
        },
        fetch: undefined
    });
    Opinions.allow({
        insert: function(userId, doc) {
            return true;
        },
        update: function(userId, docs, fields, modifier) {
            return true;

        },
        remove: function(userId, docs) {
            return true;
        },
        fetch: undefined
    });
    Comments.allow({
        insert: function(userId, doc) {
            return true;
        },
        update: function(userId, docs, fields, modifier) {
            return true;

        },
        remove: function(userId, docs) {
            return true;
        },
        fetch: undefined
    });
    SlideImgs.allow({
        insert: function(userId, doc) {
            return true;
        },
        update: function(userId, docs, fields, modifier) {
            return true;

        },
        remove: function(userId, docs) {
            return true;
        },
        fetch: undefined
    });
    
    Watchers.remove({});
    // MasterSlideNo.remove({});
    // Opinions.remove({});
    // Comments.remove({});
    // SlideImgs.remove({});
    
    if(MasterSlideNo.find().count() == 0){
        MasterSlideNo.insert({
            no: 0, 
            name:"slideno",
            point: {x:0, y:0}
        });
    }
    
    if(Opinions.find().count() == 0){
        var opinions = [
            { name: "good", count: 0 },
            { name: "bad", count: 0 }
        ];
        opinions.forEach(function(op){
            Opinions.insert(op);
        });
    }

    if(SlideImgs.find().count() == 0){
        var imgs = [];
        for(var i=0; i<10; ++i){
            imgs.push({
                no: i,
                id: "canvas_" + i,
                dataURL: ""
            });
        }
        imgs.forEach(function(img){
            SlideImgs.insert(img);
        });
    }

    Meteor.onConnection(function(connection){
        console.log("Connection id[%s]", connection.id);
    });

    Meteor.setInterval(function(){
        Watchers.remove({last_keepalive: {$lt: (new Date()).getTime() - 4000}});
    }, 1000);

    // client から呼び出されるremote method
    // 並列実行されることはない
    // method内で this.unlock()するとブロックされなくなるらしい
    Meteor.methods({
        hello: function(msg){
            console.log("Client->Server hello: " + msg);
        }
    });
});

