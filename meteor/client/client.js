console.log("##### Read client #####");

var slideWidth = 700;
var slideHeight = 500;
var slidePages = 10;

Meteor.startup(function() {
    Meteor.subscribe("watchers");
    Meteor.subscribe("masterSlideNo");
    Meteor.subscribe("opinions");
    Meteor.subscribe("slideImgs");
    Meteor.subscribe("comments");

    Meteor.call("hello", "test");
    var user_id = Watchers.insert(
        {
            last_keepalive: (new Date()).getTime()
        }
    );
    Meteor.setInterval(function(){
        Watchers.update(
            {_id: Session.get("user_id")},
            {$set: {last_keepalive: (new Date()).getTime()}}
        );
    }, 1000);
    
    Session.set("user_id", user_id);
    Session.set("numOfComments", Comments.find().count());
    Session.set("currentSlideNo", 0);
    Session.set("commentsFilter", "all");
    Session.set("syncMode", false);
    Meteor.autorun(function(){ // templateでも同様にできるはず
        console.log("autorunexec");
        var filter = Session.get("commentsFilter");
        var numOfComments = Session.get("numOfComments");
        var currentSlideNo = Session.get("currentSlideNo");

        $("#commentContainer").html("");
        
        var cursor = Comments.find({}, {sort: {no: -1}});
        var count = cursor.count();
        console.log("$$$ helper %s %d$$$", "commentsArea", cursor.count());

        cursor.forEach(function(comment){
           $div = $('<div data-comment-id="' + comment.no + '" data-target-slide-no="' + comment.targetSlideNo + '"></div>');
           $div.attr("class", "acomment");
           $div.text(comment.no + " : " + comment.comment + ":(targetSlide" + comment.targetSlideNo + ")");
           $("#commentContainer").append($div);
        });

        $(".acomment").each(function(){
            if(filter == "all"){
                $(this).css("display", "block");
            } else if($(this).data("targetSlideNo") == currentSlideNo){
                $(this).css("display", "block");
            } else{
                $(this).css("display", "none");
            }
        });
    });
    
});

$(function(){
    console.log("##### DOM Ready #####");
    if(location.hash == "#master"){
        document.title = "発表者"
    } else{
        document.title = "一般"
    }

    $("#viewport").css({
        width: slideWidth + "px",
        height: slideHeight + "px"
    });
    $("#flipsnap").css({
        width: (slideWidth * slidePages) + "px",
        height: slideHeight + "px"
    });
    $(".canvasWrapper").css({
        width: slideWidth + "px",
        height: slideHeight + "px"
    });

    $("#commentsFilter").change(function(e){
        Session.set("commentsFilter", $(this).attr("value"));
    });

    $("#commentSubmit").click(function(e){
        var comment = $("#commentsArea").val();
        if(comment == ""){
            return ;
        }
        
        comment = comment.replace(/\r?\n/g, "<br/>");
        var commentCanvasID = "ccanvas_" + getCurrentSlideNo();
        Comments.insert({
            no: -1,
            comment: comment,
            targetSlideNo: getCurrentSlideNo(),
            targetSlideSnapShot: getCanvasSnapShotURL(commentCanvasID)  
        });
       
        updateCanvas(commentCanvasID, "");

        // コメント入力後にスライドを同期
        if(!isMaster() && getMasterSlideNo() != getCurrentSlideNo() && Session.get("syncMode")){
            setCurrentSlideNo(getMasterSlideNo());
        }
       
        $("#commentsArea").val("");
    });

    $("#commentsArea").focusout(function(){
        // コメント入力後にスライドを同期
        if(!isMaster() && getMasterSlideNo() != getCurrentSlideNo() && Session.get("syncMode") && $(this).val().length == 0){
            setCurrentSlideNo(getMasterSlideNo());
        }
    });
    
    g_flipsnap = Flipsnap("#flipsnap");
    g_flipsnap.element.addEventListener("fspointmove", function(a,i){
        $("#notextbox").val(getCurrentSlideNo());
            setCurrentSlideNo(getCurrentSlideNo());
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

    //peer
    var conn; 
    if(isMaster()){
        var peer = new Peer("masterid", {
            host: "172.27.66.36",
            port: 9000,
            key: "peerjs",
            debug:3
        });
        conn = peer.connect("slaveid", {label:"chat", "serialization": "none", reliable:true});
        peer.on("open", function(id){
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ connect %s", id);
        });
        
        peer.on("connection", function(){
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ connect");
        });
        conn.on("data", function(data){
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ %s", data);
            console.log(this);
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ open");
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ send");
        });
    } else{
        var peer = new Peer("slaveid", {
            host: "172.27.66.36",
            port: 9000,
            key: "peerjs",
            debug:3
        });
        conn = peer.connect("masterid", {label:"chat","serialization": "none", reliable:true});
        peer.on("open", function(id){
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ connect %s", id);
        });
        
        peer.on("connection", function(){
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ connect");
        });
        conn.on("data", function(data){
            console.log(this);
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ %s", data);
            conn.send("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$ send");
        });
    }
    $("#testbutton").click(function(){
        console.log(conn);
        conn.send("testsjflkafjlkdajdlsjfja");
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

// memo
//db.comments.find({targetSlideNo:{$gte:0,$lte:1}})
//
