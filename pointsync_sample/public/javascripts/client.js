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
    var off = $(this).offset();
    var offsetX = e.pageX - off.left;
    var offsetY = e.pageY - off.top;
    socket.emit("mouseMove", { x: offsetX, y: offsetY });
    $('#dispArea').html("x: " + offsetX + ", y:" + offsetY);
    $('#point').css({ top : off.top + offsetY, left : off.left + offsetX, display : "block"});
});

});
