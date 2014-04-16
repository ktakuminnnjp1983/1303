$(function() {
var g_socket = io.connect("ws://" + location.host);
var g_peer = null;
var g_stream = null;
var g_id;
var g_givenMeidaConnections = {};

var g_query = location.search;
if(g_query.match(/document_id=(\d+)/) == null){
    alert("document_id is null");
    return ;
}
var g_docid = RegExp.$1;

if(typeof AudioContext == "undefined"){
    AudioContext = webkitAudioContext;
}
var g_audioProcessor;
var g_audioContext = new AudioContext();

function showKeys(hash, sep){
    var num = 0;
    var text = "";
    if(!sep){
        sep = "######";
    }
    console.log(sep);
    for(var key in hash){
        ++num;
        console.log("key:%s", key);
        text += key + "<br/>";
    }
    console.log("num of keys [%d]", num);
    console.log(sep);
    
    return {
        numOfKeys: num,
        text: text
    }
}

function GivenMediaConnections(){
    // providerID: mediaConnection
    this._mediaConnections = {};
}
GivenMediaConnections.prototype = {
    add: function(mediaConnection){
        var providerID = mediaConnection.metadata;
        if(!providerID){
            console.log("added mediaConnection does not have id");
            return ;
        }
        console.log("GivenMediaConnections [%s] add", mediaConnection.metadata);
        this._mediaConnections[mediaConnection.metadata] = mediaConnection;
        var obj = showKeys(this._mediaConnections, "G+++++");
        $("#givenDiv").html(obj.text);
    },
    remove: function(id){
        if(!id){
            console.log("no id");
            return ;
        }
        console.log("GivenMediaConnections [%s] remove", id);
        if(this._mediaConnections[id]){
            this._mediaConnections[id].close();
            delete this._mediaConnections[id];
            var obj = showKeys(this._mediaConnections, "G-----");
            $("#givenDiv").html(obj.text);
        }
    },
    clear: function(){
        for(var id in this._mediaConnections){
            this.remove(id);
        }
    },
};

function ProvideMediaConnections(){
    // listenerID: mediaConnection
    this._mediaConnections = {};
}
ProvideMediaConnections.prototype = {
    set: function(listeners){
        var currentIDs = this.getIDs();
        console.log("currentIDs:"+ currentIDs);
        console.log("listeners:"+ listeners);

        for(var i = 0; i < listeners.length; ++i){
            if(currentIDs.length == 0 || $.inArray(listeners[i], currentIDs) == -1){
                console.log("new %s", listeners[i]);
                this.add(listeners[i]);
            }
        }
        for(var i = 0; i < currentIDs.length; ++i){
            if(listeners.length == 0 || $.inArray(currentIDs[i], listeners) == -1){
                console.log("discarded %s", currentIDs[i]);
                this.remove(currentIDs[i]);
            }
        }
    },
    add: function(id){
        if(id == g_id){
            console.log("need not myself");
            return ;
        }
        var self = this;
        var mediaConnection = g_peer.call(id, g_stream);
        mediaConnection.metadata = g_id; 
        this._mediaConnections[id] = mediaConnection;
        var obj = showKeys(this._mediaConnections, "P+++++");
        $("#provideDiv").html(obj.text);

        mediaConnection.on("close", function(){
            console.log("provide mediaConnection closed [%s]", id);
            self.remove(id);
        });
    },
    remove: function(id){
        var mediaConnection = this._mediaConnections[id];
        if(mediaConnection){
            mediaConnection.close();
            delete this._mediaConnections[id];
        }
        var obj = showKeys(this._mediaConnections, "P-----");
        $("#provideDiv").html(obj.text);
    },
    clear: function(){
        for(var id in this._mediaConnections){
            this.remove(id);
        }
        this._mediaConnections = {};
    },
    getIDs: function(){
        return Object.keys(this._mediaConnections);
    }
};

var g_provideMediaConnections = new ProvideMediaConnections();
var g_givenMediaConnections = new GivenMediaConnections();

function accessAudio(listeners){
    if(navigator.webkitGetUserMedia){
        navigator.webkitGetUserMedia(
            {video:false, audio:true}, 
            function(stream){
                console.log("could get usermedia stream");
                g_stream = stream;
                g_provideMediaConnections.set(listeners);
                var source = g_audioContext.createMediaStreamSource(stream);
                g_audioProcessor = g_audioContext.createScriptProcessor(2048, 1, 1);
                source.connect(g_audioProcessor);
                g_audioProcessor.connect(g_audioContext.destination);
                g_audioProcessor.onaudioprocess = function(event){
                    // console.log(event.inputBuffer.getChannelData(0));
                    // g_socket.send(event.inputBuffer.getChannelData(0));
                    return;
                }
            },
            function erroCallback(error){
                alert(error);
                $("#mastercheck").prop("checked", false);
            }
        );
    } else if(navigator.mozGetUserMedia){
        navigator.mozGetUserMedia(
            {video:false, audio:true}, 
            function(stream){
                console.log("could get usermedia stream");
                g_stream = stream;
                g_provideMediaConnections.set(listeners);
                var source = g_audioContext.createMediaStreamSource(stream);
                g_audioProcessor = g_audioContext.createScriptProcessor(2048, 1, 1);
                source.connect(g_audioProcessor);
                g_audioProcessor.connect(g_audioContext.destination);
                g_audioProcessor.onaudioprocess = function(event){
                    console.log(event.inputBuffer.getChannelData(0));
                    // g_socket.send(event.inputBuffer.getChannelData(0));
                    return;
                }
            },
            function erroCallback(error){
                alert(error);
                $("#mastercheck").prop("checked", false);
            }
        );
    } else{
        alert("try latest Firefox or Chrome");
    }
}

g_socket.on("clientConnect", function(id){
    console.log("connect id[%s]", id);

    g_socket.emit("enterRoom", g_docid);

    g_id = id;
    $("#myid").text(id);
    $("#myroom").text(g_docid);
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
            var providerID = this.metadata;
            console.log("get stream %s", providerID);
            // $("#testaudio").attr("src", URL.createObjectURL(stream));
            var $audio = $("<audio></audio>");
            $audio.attr("id", providerID);
            $audio.attr("autoplay", "true");
            $audio.attr("src", URL.createObjectURL(stream));
            $("body").append($audio);
        });
        mediaConnection.on("close", function(){
            var providerID = this.metadata;
            g_givenMediaConnections.remove(providerID);
            var $audio = $("#"+providerID).eq(0);
            if($audio){
                $audio.remove();
            }
        });
        g_givenMediaConnections.add(mediaConnection);
    });
});

g_socket.on("getmaster", function(obj){
    console.log("getmaster result:" + obj.result);
    if(obj.result){
        // $("#listenArea").css("display", "none");
        accessAudio(obj.listeners);
    } else{
        $("#mastercheck").prop("checked", false);
        alert("音声配信は三人までです。");
    }
});
g_socket.on("getlisten", function(trueIfGetListen){
    console.log("getlisten result:" + trueIfGetListen);
    if(trueIfGetListen){
    } else{
        $("#listencheck").prop("checked", false);
    }
});
g_socket.on("listenersChanged", function(listeners){
    console.log("listeners changed " + listeners);
    g_provideMediaConnections.set(listeners);
});
g_socket.on("wantMaster", function(id){
    $("#wantDiv").html(id + " が音声を配信したがっています。");
    setTimeout(function(){
        $("#wantDiv").empty();
    }, 5000);
});
g_socket.on("numConnectionChanged", function(num){
    console.log(num);
    $("#numConnection").text(num);
});

$("#mastercheck").change(function(e){
    if(e.target.checked){
        g_socket.emit("getmaster");
    } else{
        g_audioProcessor.onaudioprocess = null
        g_stream.stop();
        g_stream = null;
        g_provideMediaConnections.clear();
        g_socket.emit("releasemaster");
        $("#listenArea").css("display", "block");
    }
});

$("#listencheck").change(function(e){
    if(e.target.checked){
        g_socket.emit("getlisten");
    } else{
        g_socket.emit("releaselisten");
        g_givenMediaConnections.clear();
        $("audio").remove();
    }
});

$(window).on("unload", function(e){
    g_provideMediaConnections.clear();
    g_givenMeidaConnections.clear();
});

});
