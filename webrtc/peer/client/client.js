var con; // for slaves
var conarr = []; // for master

var masterStream;
var isMaster = location.hash == "#master";

(function(){
    if(!isMaster) return; 
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

$(function(){
    $("#testbutton").click(function(){
        if(con){
            con.send($("#testfield").val());
        }
        for(var i=0; i<conarr.length; ++i){
            conarr[i].send($("#testfield").val());
        }
    });

    $("#muteCheck").change(function(e){
        var audio = $("#testaudio").eq(0).get(0);
        audio.muted = e.target.checked;
    });
    
    if(isMaster){
        $("#audiotrans").css("display", "block");
        var peer = new Peer("master", {
            host:location.hostname, 
            port:portnum,
            key:peerServerKey,
            debug:3
        });
        peer.on("open", function(id){
            $("body").append("<div>peer opened id:" + id + "</div>");
            document.title = "発表者";
            peer.on("connection", function(connection){ // wait slave connection...
                $("body").append("<div>" + "receive connection id:" + connection.metadata + "</div>");
                conarr.push(connection);
                connection.on("open", function(arg){
                    $("body").append("<div>" + "slave <-> master Connection established. connections:" + connection.metadata + "</div>");
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
        document.title = "一般";
        var peer = new Peer({
            host:location.hostname, 
            port:portnum,
            key:peerServerKey,
            debug:3
        });
        peer.on("open", function(id){
            $("body").append("<div>peer opened id:" + id + "</div>");
            con = peer.connect("master", {"serialization": "binary-utf8", metadata: id});
            con.on("open", function(arg){
                $("body").append("<div>" + "slave <-> master Connection established" + "</div>");
                con.on("data", function(data){
                    $("body").append("<div>master->slave " + data + "</div>");
                });
            });
            peer.on("call", function(call){
                $("body").append("<div>called from master</div>");
                call.answer(null); // slaveは返す必要無し
                call.on("stream", function(stream){
                    $("body").append("<div>get master stream</div>");
                    $("#testaudio").attr("src", URL.createObjectURL(stream));
                });
            });
        });
        peer.on("error", function(error){
            alert(error);
        });
    }

    if(isMaster){
        var recognition = new webkitSpeechRecognition();
        recognition.lang = "ja-JP"
        recognition.continuous = true;

        $("#start").click(function(){
            recognition.start();
        });
        $("#stop").click(function(){
            recognition.stop();
        });

        recognition.onsoundstart = function(){
            $("#state").text("認識中");
        };
        //マッチする認識が無い
        recognition.onnomatch = function(){
            $("#recognizedText").text("もう一度試してください");
        };
        //エラー
        recognition.onerror= function(){
            $("#recognizedText").text("エラー");
        };
        //話し声の認識終了
        recognition.onsoundend = function(){
            $("#state").text("停止中");
            setTimeout(function(){
                recognition.start();
            }, 1000);
        };
        //認識が終了したときのイベント
        recognition.onresult = function(event){
            var results = event.results;
            console.log(event);
            for (var i = event.resultIndex; i<results.length; i++){
                $("#recognizedText").text(results[i][0].transcript + " " + results[i][0].confidence);
            };
            for(var i=0; i<conarr.length; ++i){
                for (var i = event.resultIndex; i<results.length; i++){
                    for(var j=0; j<conarr.length; ++j){
                        conarr[j].send(results[i][0].transcript + " " + results[i][0].confidence);
                    }
                };
            }
        }
    }
});
