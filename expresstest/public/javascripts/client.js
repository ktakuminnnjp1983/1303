var g_io;
var g_binaryStream;
var g_listenStream;
var g_id;
var g_send = false;

var context = new AudioContext();
function sound(buffer){
    var view = new Float32Array(buffer);
    // console.log(buffer);
    // console.log(view.length);
    var source = context.createBufferSource();
    var audioBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    var data = audioBuffer.getChannelData(0);
    for(var i=0; i<view.length; ++i){
        data[i] = view[i];
    }
    source.buffer = audioBuffer;
    source.loop = false;
    // s.loopStart = 0;
    // s.loopEnd = audioBuffer.duration;
    // s.playbackRate.value = 1.0;
    source.connect(context.destination);
    source.start(0);
}

$(function(){
    console.log("### client.js start ###");
    g_io = io.connect(location.host);

    g_io.on("error", function(reason){
        alert(reason);
    });

    g_io.on("soundret", function(buffer){
        sound(buffer);
    });

    g_io.emit("enter", function(id){
        console.log("enter: " + id);
        g_id = id;

        g_bjs = new BinaryClient("ws:" + location.hostname + ":9001");
        g_bjs.on("open", function(){
            console.log("BinaryStream Connection Open");
            g_binaryStream = g_bjs.createStream({
                type: "sound",
                id : id
            });
        });
        g_bjs.on("stream", function(stream, meta){
            console.log(stream + " " + meta);
        });
    });

    $("#send").change(function(){
        if($(this).prop("checked")){
            g_send = true;
        } else{
            g_send = false;
        }
    });
    $("#listen").change(function(){
        if($(this).prop("checked")){
            g_listenStream = g_bjs.createStream({
                type: "listen",
                id : g_id
            });
            g_listenStream.on("data", function(buffer){
                sound(buffer);
            });
        } else{
        }
    });
});

var g_stream;
(function(){
    function successCallback(stream){
        g_stream = stream;
        var context = new AudioContext();
        var source = context.createMediaStreamSource(stream);
        var proc = context.createScriptProcessor(2048, 1, 1);
        source.connect(proc);
        proc.connect(context.destination);
        proc.onaudioprocess = function(event){
            var left = event.inputBuffer.getChannelData(0);
            if(g_send){
                g_binaryStream.write(left.buffer);
            }
            // g_io.emit("sound", left.buffer);
        }
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
