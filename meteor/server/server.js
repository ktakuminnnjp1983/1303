console.log("Read server");

Meteor.startup(function () {
    console.log("Server startup");
    Watchers.remove({});
    MasterSlideNo.remove({});
    Opinions.remove({});
    
    MasterSlideNo.insert({no: 0, name:"slideno"});
    
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

