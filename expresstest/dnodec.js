var dnode = require('dnode');

var d = dnode.connect(5004);
d.on("remote", function(remote){
    remote.test("hoge", function(ret){
        console.log(ret);
        d.end();
    });
});
