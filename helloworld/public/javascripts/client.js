var socket = new WebSocket("ws://" + location.host);

socket.onopen = function(){
    console.log("Client onopen");
};

socket.onmessage = function(message){
    console.log("get some message");
    console.log(message.data.constructor);
    if(message.data.constructor == String){
        console.log("sended binaryString");
        var buffer = new Uint8Array(message.data.length);
        for(var i=0; i<message.data.length; ++i){
            buffer[i] = message.data.charCodeAt(i);
        }
        var b = new Blob([buffer.buffer], {type:"image\/jpeg"});
        var reader = new FileReader();
        reader.onload = function(e){
            console.log(reader.result);
            $("#imgArea").attr("src", reader.result);
        }
        reader.readAsDataURL(b);
    } else if(message.data.constructor == Blob){
        var reader = new FileReader();
        reader.onload = function(e){
            console.log("readblobdata");
            $("#imgArea").attr("src", reader.result);
        }
        reader.readAsDataURL(message.data);
    } else if(message.data.constructor == ArrayBuffer){
        var buffer = new Uint8Array(message.data);
        var b = new Blob([buffer], {type:"image\/jpeg"});
        var reader = new FileReader();
        console.log(message.data);
        reader.onload = function(e){
            console.log("readArrayBufferData %d", buffer.length);
            $("#imgArea").attr("src", reader.result);
        }
        reader.readAsDataURL(b);
    } else{
        alert("error");        
    }
    // console.log(message.data);
    // console.log(message.data.constructor);
    // console.log(typeof message.data);
    // console.log(message.type);
    // console.log(message.data.charCodeAt(0).toString(16));

}

// var mediaStream;
// navigator.webkitGetUserMedia(
    // {video: true, audio: true},
    // function(stream){
        // mediaStream = stream;
        // for(var prop in stream){
                // console.log(prop + " " + stream[prop]);
        // }
        // alert(stream.record);
    // }, 
    // function(){
        // alert("media fail");
    // }
// );


$(function(){
    $("#textButton").click(function(event){
        socket.send("textMessage");
    });

    $("#fileUpString").change(function(event){
        var f = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
            console.log("read binarySting %d", reader.result.length);
            socket.send(reader.result);
        };
        reader.readAsBinaryString(f);
    });
    $("#fileUpBlob").change(function(event){
        socket.binaryType = "blob";
        var f = this.files[0];
        console.log("upload blob(file) %d", f.size);
        socket.send(f);
    });
    $("#fileUpArrayBuffer").change(function(event){
        socket.binaryType = "arraybuffer";
        var f = this.files[0];
        var reader = new FileReader();
        reader.onload = function(e){
            console.log(reader.result);
            console.log(reader.result.constructor);
            var buf = new Uint8Array(reader.result);
            console.log("read arrayBuffer %d", buf.length);
            socket.send(buf);
        };
        reader.readAsArrayBuffer(f);
    });

    // setTimeout(function(){
        // var recorder = mediaStream.record();
        // recorder.getRecordedData(function(blob){
           // socket.send(blob);
        // });
    // }, 1000);
});
