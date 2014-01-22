$(function() {
var host = $("#serverAddr").text();

var socket = io.connect("ws://" + host);

// callbacks
socket.on('connectionOK', function(data){
    $('#status').html("サーバとのコネクションを確立しました");
});
socket.on('disconnect', function(message){
    $('#status').html("サーバとのコネクションが切断されました");
});

socket.on('syncPoint', function(data){
    $('#dispArea').html("x: " + data.x + ", y:" + data.y);
    var offsetX = $('#moveArea').offset().left;
    var offsetY = $('#moveArea').offset().top;
    $('#point').css({ top : offsetY+data.y, left : offsetX+data.x, display : "block"});
});

// events
$('#moveArea').mousemove(function(e){
    socket.emit("mouseMove", { x: e.offsetX, y: e.offsetY });
    $('#dispArea').html("x: " + e.offsetX + ", y:" + e.offsetY);
    $('#point').css({ top : e.clientY, left : e.clientX, display : "block"});
});

});
