console.log("Read server");

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
    
    Watchers.remove({});
    MasterSlideNo.remove({});
    Opinions.remove({});
    Comments.remove({});
    
    MasterSlideNo.insert({
        no: 0, 
        name:"slideno",
        point: {x:0, y:0}
    });
    
    var opinions = [
        { name: "good", count: 0 },
        { name: "bad", count: 0 }
    ];
    opinions.forEach(function(op){
        Opinions.insert(op);
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

