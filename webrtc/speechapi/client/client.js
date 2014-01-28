$(function(){
    var recognition = new webkitSpeechRecognition();
    recognition.lang = "ja-JP"
    recognition.continuous = true;
    
    $("#start").click(function(){
        recognition.start();
    });
    $("#stop").click(function(){
        recognition.stop();
    });

    recognition.onsoundstart = function(){
        $("#state").text("認識中");
    };
    //マッチする認識が無い
    recognition.onnomatch = function(){
        $("#recognizedText").text("もう一度試してください");
    };
    //エラー
    recognition.onerror= function(){
        $("#recognizedText").text("エラー");
    };
    //話し声の認識終了
    recognition.onsoundend = function(){
        $("#state").text("停止中");
    };
    //認識が終了したときのイベント
    recognition.onresult = function(event){
        var results = event.results;
        for (var i = event.resultIndex; i<results.length; i++){
            $("#recognizedText").text(results[i][0].transcript);
        };
    }
});
