console.log("##### read ws #####");

var canvasStrokes = {};

var wsAddr = "ws://" + location.hostname + ":3010";
g_socket = new WebSocket(wsAddr);
g_socket.onopen = function(){
    console.log("Client onopen connect WebSocket-Node");
    var test = {
        key: "test",
        val: "testval",
        bloadcast: "false"
    };
    g_socket.send(JSON.stringify(test));
};
g_socket.onmessage = function(message){
    if(message.data.constructor === String){
        var obj = JSON.parse(message.data);
        if(obj.key == "slidePoint"){
            // console.log(obj.val.x + " " + obj.val.y);
            var off = $("#viewport").offset();
            $("#point").css({
                top: off.top + obj.val.y,
                left: off.left + obj.val.x
            });
        } else if(obj.key == "canvasStroke"){
            var id = obj.val.id;
            var x = obj.val.x;
            var y = obj.val.y;
            console.log("%s(%d, %d)", id, x, y);
            if(canvasStrokes[id] == undefined || canvasStrokes[id].px == -1 || canvasStrokes[id].py == -1){
                canvasStrokes[id] = {
                    px: x,
                    py: y
                };
                return ;
            } else{
                var px = canvasStrokes[id].px;
                var py = canvasStrokes[id].py;
                canvasStrokes[id] = {
                    px: x,
                    py: y 
                };
                if(x == -1 && y == -1){
                    return ;
                }
                // draw
                var context = $("#" + id).get(0).getContext("2d");
                if(obj.val.mode == "pen"){
                    context.globalCompositeOperation = "source-over";
                } else{
                    context.globalCompositeOperation = "destination-out";
                }
                context.beginPath();             // パスのリセット
                context.lineWidth = obj.val.mode == "erase" ? 15 : 5;
                context.strokeStyle="#ff0000";   // 線の色
                context.moveTo(px, py);           // 開始位置
                context.lineTo(x, y);         // 次の位置
                context.stroke();    
            }
        } else if(obj.key == "selectedComment"){
            var commentID = Number(obj.val.commentID);
            console.log("selectedComment is broadcasted:%d", commentID);
            if(Session.get("syncMode")){
                selectComment(commentID);
            }
        }
    } else if(message.data.constructor === Blob){
        var context = $("canvas").eq(0).get(0).getContext("2d");
        // context.clearRect(0, 0, 700, 500);
        var reader = new FileReader();
        console.log("try");
        reader.onload = function(){
            var img = new Image();
            img.src = reader.result;
            setTimeout(function(){
                context.drawImage(img, 0, 0);
            },0);
        };
        reader.readAsDataURL(message.data);
    } else{
        alert(message.data.constructor);
    }
};

Meteor.startup(function(){

var masterStream;
(function(){
    if(!isMaster()) return; 
    function successCallback(stream){
        masterStream = stream;
    }
    function erroCallback(error){
        alert(error);
    }
    if(navigator.webkitGetUserMedia){
        navigator.webkitGetUserMedia(
            {video:false, audio:true}, 
            successCallback,
            erroCallback
        );
    } else if(navigator.mozGetUserMedia){
        navigator.mozGetUserMedia(
            {video:false, audio:true}, 
            successCallback,
            erroCallback
        );
    } else{
        alert("try latest Firefox or Chrome");
    }
})();

if(isMaster()){
    var peer = new Peer("master", {
        host:location.hostname, 
        port:peerPortnum,
        key:peerServerKey,
        debug:3
    });
    peer.on("open", function(id){
        peer.on("connection", function(connection){ // wait slave connection...
            connection.on("open", function(arg){
                connection.on("data", function(data){
                    $("body").append("<div>slave->master " + data + "</div>");
                });
                if(masterStream){
                    peer.call(connection.metadata, masterStream);
                } 
            });
        });
    });
    peer.on("error", function(error){
        alert(error);
    });
} else{
    var peer = new Peer({
        host:location.hostname, 
        port:peerPortnum,
        key:peerServerKey,
        debug:3
    });
    peer.on("open", function(id){
        con = peer.connect("master", {"serialization": "none", metadata: id});
        con.on("open", function(arg){
        });
        peer.on("call", function(call){
            call.answer(null); // slaveは返す必要無し
            call.on("stream", function(stream){
                $("#audio").attr("src", URL.createObjectURL(stream));
            });
        });
    });
    peer.on("error", function(error){
        alert(error);
    });
}

});
