var socket = new WebSocket("ws://192.168.11.10:3000");
socket.binaryType = "blob";

socket.onopen = function(){
    console.log("Client onopen");
};

socket.onmessage = function(message){
    console.log(message);
    var reader = new FileReader();
    reader.onload = function(e){
        console.log("readblobdata");
        $("#imgArea").attr("src", reader.result);
    }
    reader.readAsDataURL(message.data);
}

var mediaStream;
navigator.webkitGetUserMedia(
    {video: true, audio: true},
    function(stream){
        mediaStream = stream;
        for(var prop in stream){
                console.log(prop + " " + stream[prop]);
        }
        alert(stream.record);
    }, 
    function(){
        alert("media fail");
    }
);


$(function(){
    $("#textButton").click(function(event){
        socket.send("textMessage");
    });

    $("#fileButton").change(function(event){
        var f = $("#fileButton").get(0).files[0];
        socket.send(f);
    });

    setTimeout(function(){
        var recorder = mediaStream.record();
        recorder.getRecordedData(function(blob){
           socket.send(blob);
        });
    }, 1000);
});
