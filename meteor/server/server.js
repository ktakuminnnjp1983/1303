console.log("##### Read server #####");

var Watchers = new Meteor.Collection("watchers");
var Opinions = new Meteor.Collection("opinions");
var MasterSlideNo = new Meteor.Collection("masterSlideNo");
var Comments = new Meteor.Collection("comments");
var SlideImgs = new Meteor.Collection("slideImgs");

// websocket settings
// http://d.hatena.ne.jp/nextliteracy/20131203/1386033577
// npm install -g meteorite
// mrt add npm
// mrt
//

function setPermissions(){
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
    
}

Meteor.startup(function () {
    console.log("Server startup");
    // peer settings

    var PeerServer = Meteor.require("peer").PeerServer;
    PeerServer({port: peerPortnum, key: peerServerKey, debug: 3});
    
    Meteor.publish("watchers", function(){
        return Watchers.find();
    });
    Meteor.publish("masterSlideNo", function(){
        return MasterSlideNo.find();
    });
    Meteor.publish("opinions", function(){
        return Opinions.find();
    });
    Meteor.publish("comments", function(filter){
        return Comments.find({});
    });
    Meteor.publish("slideImgs", function(){
        return SlideImgs.find();
    });
    
    if(MasterSlideNo.find().count() == 0){
        MasterSlideNo.insert({
            no: 0
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

    Comments.find().observe({
        added: function(newDocument){
            var count = Comments.find().count();
            if(newDocument.no != -1){
                return ;
            }
            console.log("comment added:" + count);
            Comments.update(
                {_id: newDocument._id},
                {$set: {no: count-1}}
            );
        }
    });

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

