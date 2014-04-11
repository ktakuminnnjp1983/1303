$(function() {
var socket = io.connect("ws://" + location.host);

socket.on("getmaster", function(trueIfGetMaster){
    console.log("getmaster result:" + trueIfGetMaster);
    if(trueIfGetMaster){
        $("#listenArea").css("display", "none");
    } else{
        $("#mastercheck").prop("checked", false);
        $("#listenArea").css("display", "block");
    }
});
socket.on("getlisten", function(trueIfGetListen){
    console.log("getlisten result:" + trueIfGetListen);
    if(trueIfGetListen){
    } else{
        $("#listencheck").prop("checked", false);
    }
});
socket.on("masterChanged", function(masterID){
    console.log("master changed [%s]", masterID);
    if(!masterID){
        $("#mastercheck").prop("checked", false);
        $("#listencheck").prop("checked", false);
        $("#listenArea").css("display", "block");
        $("#masterArea").css("display", "block");
    } else{
        $("#masterArea").css("display", "none");
    }
});
socket.on("listenersChanged", function(listeners){
    console.log("listeners changed " + listeners);
});

$("#mastercheck").change(function(e){
    if(e.target.checked){
        socket.emit("getmaster");
    } else{
        socket.emit("releasemaster");
        $("#listenArea").css("display", "block");
    }
});

$("#listencheck").change(function(e){
    if(e.target.checked){
        socket.emit("getlisten");
    } else{
        socket.emit("releaselisten");
    }
});

});
