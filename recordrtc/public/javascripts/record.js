var g_stream = null;
var g_canvasRecorder = null;
var g_audioRecorder = null;

var g_f1 = false;
var g_f2 = false;

var g_s = null;

(function accessAudio(){
    if(navigator.webkitGetUserMedia){
        navigator.webkitGetUserMedia(
            {video:false, audio:true}, 
            function(stream){
                console.log("could get usermedia stream");
                g_stream = stream;
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
            },
            function erroCallback(error){
                alert(error);
            }
        );
    } else{
        alert("try latest Firefox or Chrome");
    }
})()

function waitForComplete()
{
    console.log(g_f1 + " " + g_f2);
    if(g_f1 == false || g_f2 == false){
        setTimeout(waitForComplete, 500);
        console.log("retry");
    } else{
        console.log("complete recording");
        g_s.emit("sendBinary", {
            audio: g_audioRecorder.getBlob(),
            canvas: g_canvasRecorder.getBlob()
        });
    }
}

$(function(){
    g_s = io.connect(location.host);
    
    var targetEl = document.getElementById("canvas");
    g_canvasRecorder = RecordRTC(targetEl, {
        type: "canvas"
    }); 
    
    $("#startButton").click(function(){
        g_audioRecorder = RecordRTC(g_stream, {
            "sample-rate": 22050
        });
        g_audioRecorder.startRecording();
        g_canvasRecorder.startRecording();
        console.log("start audio/canvas Recorder");

        var worker = new Worker("/javascripts/worker.js");
        worker.onmessage = function(event){
            console.log(event.data);
        };
        var data = new Uint8Array(32*1000000);
        worker.postMessage(g_s);
    });
    
    $("#stopButton").click(function(){
        g_audioRecorder.stopRecording(function(url){
            console.log("stop audioRecorder");
            g_f1 = true;
        });
        g_canvasRecorder.stopRecording(function(url){
            console.log("stop canvasRecorder");
            g_f2 = true;
        });
        waitForComplete();
    });
});

window.onload = function() {
    var canvas = document.getElementById('canvas');
    if(!canvas.getContext){
    	return ;
    }
    
    var cc = canvas.getContext('2d');

    // 円の初期座標
    var x = canvas.width / 2;
    var y = canvas.height / 2;
    var r = 30;

    // 速度
    var v_x = 2.0;
    var v_y = 2.0;

    // メインループ
    var loop = function() {

        // 円の座標を変更
        x += v_x;
        y += v_y;


      	// canvasの境界
        if (x - r < 0) {
           x = r;
           v_x *= -1;
        }
        if (x + r > canvas.width) {
           x = canvas.width - r;
           v_x *= -1;
        }
        if (y - r < 0) {
            y = r;
            v_y *= -1;
        }
        if (y + r > canvas.height) {
            y = canvas.height - r;
            v_y *= -1;
        }


      	// 円の描画
        cc.save();

        cc.beginPath();
        cc.clearRect(0, 0, canvas.width, canvas.height);

        cc.restore();

        cc.beginPath();

        cc.strokeStyle = '#00F';
        cc.fillStyle = '#00F';
        cc.arc(x, y, r, 0, Math.PI * 2, false);
        cc.fill();
        cc.stroke();

        cc.restore();


        // 次の実行
        setTimeout(loop, 30);
     };

     // 初期起動
     loop();
};

