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

socket.on('fileBroadcast', function(file){
    console.log("fileBroadcasted" + file.val);
    var buffer = new Uint8Array(file.val);
    var b = new Blob([buffer], {type:"image\/jpeg"});
    var reader = new FileReader();
    console.log(file.val);
    reader.onload = function(e){
        console.log("readArrayBufferData %d", buffer.length);
        $("#imgArea").attr("src", reader.result);
    }
    reader.readAsDataURL(b);
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

$("#binaryUpload").change(function(e){
    // socket.emit("binaryFile", {val : this.files[0]});
    var reader = new FileReader();
    reader.onload = function(e){
        console.log(reader.result);
        socket.emit("binaryFile", {val: reader.result});
    };
    reader.readAsArrayBuffer(this.files[0]);
});


});
