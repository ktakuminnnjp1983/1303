var g_socket = new WebSocket("ws://" + location.host);
var g_isMaster = location.hash == "#master";

if(typeof AudioContext == "undefined"){
    AudioContext = webkitAudioContext;
}

g_socket.onopen = function(){
    console.log("Client onopen");
};

var context = new AudioContext();
g_socket.onmessage = function(message){
    console.log(message);
    if(message.data.constructor === String){
        var obj = JSON.parse(message.data);
    } else if(message.data.constructor === Blob){
        var fileReader = new FileReader();
        fileReader.onload = function(){
            var view = new Float32Array(fileReader.result);
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
            return ;
        }
        fileReader.readAsArrayBuffer(message.data);
    } else{
        alert("error");
    }
};


var g_stream;
(function(){
    if(!g_isMaster){
        return ;
    }

    function successCallback(stream){
        var context = new AudioContext();
        var source = context.createMediaStreamSource(stream);
        var proc = context.createScriptProcessor(2048, 1, 1);
        source.connect(proc);
        proc.connect(context.destination);
        proc.onaudioprocess = function(event){
            g_stream = stream;
            console.log(event.inputBuffer.getChannelData(0));
            g_socket.send(event.inputBuffer.getChannelData(0));
            // g_socket.send("test");
            return;
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

$(function(){
    if(g_isMaster){
    } else{
    }
    
    $("#soundDownload").click(function(){
        g_socket.send("getFile");
    });
    
});
