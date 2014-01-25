console.log("##### Read client ######");

with(g_clientExports){

var slideWidth = 700;
var slideHeight = 500;
var slidePages = 10;

Meteor.startup(function() {
    console.log("##### Client startup #####");
    Meteor.subscribe("watchers");
    Meteor.subscribe("masterSlideNo");
    Meteor.subscribe("opinions");
    Meteor.subscribe("comments");
    Meteor.subscribe("slideImgs");

    Meteor.call("hello", "test");
    
    var user_id = Watchers.insert(
        {
            last_keepalive: (new Date()).getTime()
        }
    );
    Session.set("user_id", user_id);
    Meteor.setInterval(function(){
        Watchers.update(
            {_id: Session.get("user_id")},
            {$set: {last_keepalive: (new Date()).getTime()}}
        );
    }, 1000);
});

$(function(){
    console.log("##### DOM Ready #####");
    if(location.hash == "#master"){
        document.title = "発表者"
    } else{
        document.title = "一般"
    }
    
    $("#viewport, .canvasWrapper").css({
        width: slideWidth + "px",
        height: slideHeight + "px"
    });
    $("#flipsnap").css({
        width: (slideWidth*slidePages) + "px",
        height: slideHeight + "px"
    });
    
    g_flipsnap = Flipsnap("#flipsnap");
    g_flipsnap.element.addEventListener("fspointmove", function(a,i){
        $("#notextbox").val(getCurrentSlideNo());
        if(isMaster()){
            setMasterSlideNo(getCurrentSlideNo());
        }
    }, false);

    $(".masterCanvas,.commentCanvas").each(function(el){
        this.width = slideWidth;
        this.height = slideHeight;

        $(this).mousemove(function(e){
            if(getSlideMode() == "slide"){
                return true;
            }
            e.stopPropagation();
            
            var startX = $.data(this, "px");
            var startY = $.data(this, "py");
            var off = $(this).offset();
            var offsetX = e.pageX - off.left; 
            var offsetY = e.pageY - off.top;
            var x = offsetX;
            var y = offsetY;
            if($.data(this, "mousedowning") && startX != null && startY != null){ 
                var x = offsetX;
                var y = offsetY;
                var context = this.getContext("2d");
                context.beginPath();             // パスのリセット
                context.lineWidth = getSlideMode() == "erase" ? 15 : 5;           // 線の太さ
                context.strokeStyle= isMaster() ? "#ff0000" : "#0000ff";   // 線の色
                context.moveTo(startX, startY);           // 開始位置
                context.lineTo(x, y);         // 次の位置
                context.stroke();    
                
                if(isMaster()){
                    var obj ={
                        key: "canvasStroke",
                        val: {
                            id: $(this).attr("id"),
                            x: x,
                            y: y,
                            mode: getSlideMode() 
                        }
                    };
                    g_socket.send(JSON.stringify(obj));
                }
            }    
          
            $.data(this, "px", x);
            $.data(this, "py", y);
        });
        $(this).mousedown(function(e){
            if(getSlideMode() == "slide"){
                return true;
            }
            e.stopPropagation();
            
            var context = this.getContext("2d");
            if(getSlideMode() == "erase"){
                context.globalCompositeOperation = "destination-out";
            } else{
                context.globalCompositeOperation = "source-over";
            }
            
            $.data(this, "mousedowning", true);
        });
        $(this).mouseup(function(e){
            if(getSlideMode() == "slide"){
                return true;
            }
            e.stopPropagation();
            
            $.data(this, "mousedowning", false);
            if(!isMaster()){
                return true;
            }
            
            var obj ={
                key: "canvasStroke",
                val: {
                    id: $(this).attr("id"),
                    x: -1,
                    y: -1
                }
            };
            console.log(e.target.id);
            var id = e.target.id;
            var snapshotURL = getCanvasSnapShotURL(e.target);
            updateSlideDataURL(id, snapshotURL);

            this.getContext("2d").globalCompositeOperation = "source-over";
            g_socket.send(JSON.stringify(obj));
        });
        $(this).mouseleave(function(e){
            if(getSlideMode() == "slide"){
                return true;
            }
            e.stopPropagation();
            
            $.data(this, "px", null);
            $.data(this, "py", null);
            $.data(this, "mousedowning", false);
            this.getContext("2d").globalCompositeOperation = "source-over";
            if(isMaster()){
                var obj ={
                    key: "canvasStroke",
                    val: {
                        id: $(this).attr("id"),
                        x: -1,
                        y: -1
                    }
                };
                g_socket.send(JSON.stringify(obj));
            }
        });
    });

    $(document).on("click", ".acomment", function(e){
        var commentID = Number($(this).data("commentId"));
        selectComment(commentID);
        if(isMaster()){
            // 選択されたコメントIDをブロードキャスト
            var obj = {
                key: "selectedComment",
                val: {
                    commentID: commentID
                }
            };
            g_socket.send(JSON.stringify(obj));
        }
        return true;
    });
    // $("#mainFrame").resizable({handles: "e"});
    
    // var successCallback = function(stream) {
        // var video = jQuery("#chat");
        // var videoStream = window.webkitURL ? window.webkitURL.createObjectURL(stream) : stream;
        // video.attr("src", videoStream);
    // };
    // var failCallback = function(error) {
        // alert("error... code : " + error.code);
    // };
    // navigator.webkitGetUserMedia(
        // {video: false, audio: true},
        // successCallback, 
        // failCallback
    // );
});

}

// memo
//db.comments.find({targetSlideNo:{$gte:0,$lte:1}})
//
