$(function() {
var g_socket = io.connect("ws://" + location.host);
var g_id = "";
var g_peer = null;

var g_givenMeidaConnection = null;

var g_stream = null;
var g_currentListeners = [];
var g_mediaConnections = {};

function successCallback(stream){
    console.log("could get usermedia stream");
    g_stream = stream;
    for(var i = 0; i < g_currentListeners.length; ++i){
        var mediaConnection = g_peer.call(g_currentListeners[i], g_stream);
        mediaConnection.metadata = g_currentListeners[i]; 
        g_mediaConnections[listeners[i]] = mediaConnection;
        mediaConnection.on("close", function(){
            console.log("mediaConnection closed [%s]", this.metadata);
            var target = g_mediaConnections[this.metadata];
            if(target){
                delete g_mediaConnections[this.metadata];
            }
        });
    }
}
function erroCallback(error){
    alert(error);
}
function accessAudio(){
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
}

g_socket.on("clientConnect", function(id){
    g_id = id;
    console.log("connect id[%s]", id);
    g_peer = new Peer(id, {
        host:location.hostname, 
        port:9000,
        key:"peerjs",
        debug:3 
    });
    g_peer.on("call", function(mediaConnection){
        console.log("received stream");
        mediaConnection.answer(null);
        mediaConnection.on("stream", function(stream){
            console.log("get stream");
            $("#testaudio").attr("src", URL.createObjectURL(stream));
        });
        mediaConnection.on("close", function(){
            if(g_givenMeidaConnection){
                console.log("connection closed [%s]", g_givenMeidaConnection.metadata);
                g_givenMeidaConnection = null;
            }
        });
        g_givenMeidaConnection = mediaConnection;
    });
});

g_socket.on("getmaster", function(obj){
    console.log("getmaster result:" + obj.result);
    if(obj.result){
        $("#listenArea").css("display", "none");
        g_currentListeners = obj.listeners;
        accessAudio();
    } else{
        $("#mastercheck").prop("checked", false);
        $("#listenArea").css("display", "block");
    }
});
g_socket.on("getlisten", function(trueIfGetListen){
    console.log("getlisten result:" + trueIfGetListen);
    if(trueIfGetListen){
    } else{
        $("#listencheck").prop("checked", false);
    }
});
g_socket.on("masterChanged", function(masterID){
    console.log("master changed [%s]", masterID);
    if(!masterID){
        $("#mastercheck").prop("checked", false);
        $("#listencheck").prop("checked", false);
        $("#listenArea").css("display", "block");
        $("#masterArea").css("display", "block");
    } else{
        $("#masterArea").css("display", "none");
    }
    if(g_givenMeidaConnection){
        g_givenMeidaConnection.close();
        g_givenMeidaConnection = null;
    }
});
g_socket.on("listenersChanged", function(listeners){
    console.log("listeners changed " + listeners);
    for(var i = 0; i < listeners.length; ++i){
        if(g_currentListeners.length == 0 || $.inArray(listeners[i], g_currentListeners) == -1){
            console.log("new %s", listeners[i]);
            var mediaConnection = g_peer.call(listeners[i], g_stream);
            mediaConnection.metadata = listeners[i]; 
            g_mediaConnections[listeners[i]] = mediaConnection;
            mediaConnection.on("close", function(){
                console.log("mediaConnection closed [%s]", this.metadata);
                var target = g_mediaConnections[this.metadata];
                if(target){
                    delete g_mediaConnections[this.metadata];
                }
            });
        }
    }
    g_currentListeners = listeners;
});

$("#mastercheck").change(function(e){
    if(e.target.checked){
        g_socket.emit("getmaster");
    } else{
        g_stream.stop();
        g_stream = null;
        for(var prop in g_mediaConnections){
            g_mediaConnections[prop].close();
            delete g_mediaConnections[prop];
        }
        g_mediaConnections = {};
        g_socket.emit("releasemaster");
        $("#listenArea").css("display", "block");
    }
});

$("#listencheck").change(function(e){
    if(e.target.checked){
        g_socket.emit("getlisten");
    } else{
        g_socket.emit("releaselisten");
        if(g_givenMeidaConnection){
            g_givenMeidaConnection.close();
            g_givenMeidaConnection = null;
        }
    }
});

$(window).on("unload", function(e){
    if(g_givenMeidaConnection){
        g_givenMeidaConnection.close();
    }
    for(var prop in g_mediaConnections){
        g_mediaConnections[prop].close();
    }
});

});
