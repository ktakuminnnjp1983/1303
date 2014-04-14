$(function() {
var g_socket = io.connect("ws://" + location.host);
var g_peer = null;
var g_givenMeidaConnection = null;
var g_stream = null;

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
}

function MediaConnections(){
    this._mediaConnections = {};
}
MediaConnections.prototype = {
    add: function(id){
        var self = this;
        var mediaConnection = g_peer.call(id, g_stream);
        mediaConnection.metadata = id; 
        this._mediaConnections[id] = mediaConnection;
        mediaConnection.on("close", function(){
            console.log("mediaConnection closed [%s]", this.metadata);
            self.remove(id);
        });
        showKeys(this._mediaConnections, "+++++");
    },
    set: function(listeners){
        var currentIDs = this.getIDs();
        console.log("listeners:"+ listeners);
        for(var i = 0; i < listeners.length; ++i){
            if(currentIDs.length == 0 || $.inArray(listeners[i], currentIDs) == -1){
                console.log("new %s", listeners[i]);
                this.add(listeners[i]);
            }
        }
        showKeys(this._mediaConnections, "+++++");
    },
    remove: function(id){
        var mediaConnection = this._mediaConnections[id];
        if(mediaConnection){
            mediaConnection.close();
            delete this._mediaConnections[id];
        }
        showKeys(this._mediaConnections, "-----");
    },
    clear: function(){
        for(var id in this._mediaConnections){
            this.remove(id);
        }
        this._mediaConnections = null;
    },
    getIDs: function(){
        return Object.keys(this._mediaConnections);
    }
};

var g_mediaConnections = new MediaConnections();

function accessAudio(listeners){
    if(navigator.webkitGetUserMedia){
        navigator.webkitGetUserMedia(
            {video:false, audio:true}, 
            function(stream){
                console.log("could get usermedia stream");
                g_stream = stream;
                g_mediaConnections.set(listeners);
            },
            function erroCallback(error){
                alert(error);
            }
        );
    } else if(navigator.mozGetUserMedia){
        navigator.mozGetUserMedia(
            {video:false, audio:true}, 
            function(stream){
                console.log("could get usermedia stream");
                g_stream = stream;
                g_mediaConnections.set(listeners);
            },
            function erroCallback(error){
                alert(error);
            }
        );
    } else{
        alert("try latest Firefox or Chrome");
    }
}

g_socket.on("clientConnect", function(id){
    console.log("connect id[%s]", id);
    g_peer = new Peer(id, {
        host:location.hostname, 
        port:9000,
        key:"peerjs",
        debug:0 
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
                console.log("mediaConnection closed [%s]", g_givenMeidaConnection.metadata);
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
        accessAudio(obj.listeners);
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
        // $("#listencheck").prop("checked", false);
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
    g_mediaConnections.set(listeners);
});

$("#mastercheck").change(function(e){
    if(e.target.checked){
        $("#listencheck").prop("checked", false);
        g_socket.emit("releaselisten");
        g_socket.emit("getmaster");
    } else{
        g_stream.stop();
        g_stream = null;
        g_mediaConnections.clear();
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
    g_mediaConnections.clear();
});

});
