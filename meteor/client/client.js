console.log("Read client");

var g_socket = null;
var g_canvasStrokes = {};

function showObj(obj){
    for(var p in obj){
        console.log(p + ":" + obj[p]);
    }
}

function isMaster(){
    return location.hash === "#master";
}

function getSlideMode(){
    return $("input[name=selectMode]:checked").val()
}

function updateCanvas(target, dataURL){
    console.log("updateCanvas: " + target);
    if(!target){
        alert("argError");
    }
    
    var canvas;
    if(typeof target === "string"){
        canvas = $("#"+target).eq(0).get(0);
    } else if(typeof target === "object"){
        canvas = target;
    } else{
        alert("argError2");
    }

    console.log("##### " + dataURL);
    var context = canvas.getContext("2d");
    
    if(dataURL == ""){
        context.clearRect(0, 0, canvas.width, canvas.height);
        return ;
    }
   
    context.clearRect(0, 0, canvas.width, canvas.height);
    var img = new Image();
    img.src = dataURL;
    img.onload = function(){
        context.drawImage(img, 0, 0);
    }
}

function updateSlideDataURL(target, dataURL){
    var _id;
   
    var key = {};
    if(typeof target === "number"){
        key.no = target;
    } else if(typeof target === "string"){
        key.id = target;
    }
    
    _id = SlideImgs.findOne(key)._id;
    SlideImgs.update(
        {_id: _id},
        {
            $set: {
                dataURL: dataURL
            }
        }
    );
}

function getCanvasSnapShotURL(target){
    if(!target){
        alert("argError");
    }

    var canvas;
    if(typeof target === "string"){
        canvas = $("#"+target).eq(0).get(0);
    } else if(typeof target === "object"){
        canvas = target;
    } else{
        alert("argError2");
    }
    var type = 'image/png';
    return canvas.toDataURL(type);
}

function getCurrentSlideNo(){
    return g_flipsnap.currentPoint;
}
function setCurrentSlideNo(no){
    g_flipsnap.moveToPoint(no);
}

function selectComment(commentID){
    var targetDoc = Comments.findOne({no: commentID});
    var _id = targetDoc._id;
    var targetSlideNo = targetDoc.targetSlideNo;
    var targetSlideSnapShot = targetDoc.targetSlideSnapShot;
    console.log("jumpSlide with comment:%d targetSlideNo:%d", commentID, targetSlideNo);
    console.log(targetSlideSnapShot);

    setCurrentSlideNo(targetSlideNo);
    if(isMaster()){
        setMasterSlideNo(targetSlideNo);
    }
    var targetCanvas = $(".commentCanvas").eq(targetSlideNo).get(0);
    // updateCanvas(targetCanvas, "");
    updateCanvas(targetCanvas, targetSlideSnapShot);
}

Meteor.startup(function() {
    // ws setting
    console.log("Client startup");
    var wsAddr = "ws://" + location.hostname + ":3010";
    g_socket = new WebSocket(wsAddr);
    g_socket.onopen = function(){
        console.log("Client onopen connect WebSocket-Node");
        var test = {
            key: "test",
            val: "testval",
            bloadcast: "false"
        };
        g_socket.send(JSON.stringify(test));
    };
    g_socket.onmessage = function(message){
        if(message.data.constructor === String){
            var obj = JSON.parse(message.data);
            if(obj.key == "slidePoint"){
                // console.log(obj.val.x + " " + obj.val.y);
                var off = $("#viewport").offset();
                $("#point").css({
                    top: off.top + obj.val.y,
                    left: off.left + obj.val.x
                });
            } else if(obj.key == "canvasStroke"){
                var id = obj.val.id;
                var x = obj.val.x;
                var y = obj.val.y;
                console.log("%s(%d, %d)", id, x, y);
                if(g_canvasStrokes[id] == undefined || g_canvasStrokes[id].px == -1 || g_canvasStrokes[id].py == -1){
                    g_canvasStrokes[id] = {
                        px: x,
                        py: y
                    };
                    return ;
                } else{
                    var px = g_canvasStrokes[id].px;
                    var py = g_canvasStrokes[id].py;
                    g_canvasStrokes[id] = {
                        px: x,
                        py: y 
                    };
                    if(x == -1 && y == -1){
                        return ;
                    }
                    // draw
                    var context = $("#" + id).get(0).getContext("2d");
                    if(obj.val.mode == "pen"){
                        context.globalCompositeOperation = "source-over";
                    } else{
                        context.globalCompositeOperation = "destination-out";
                    }
                    context.beginPath();             // パスのリセット
                    context.lineWidth = obj.val.mode == "erase" ? 15 : 5;
                    context.strokeStyle="#ff0000";   // 線の色
                    context.moveTo(px, py);           // 開始位置
                    context.lineTo(x, y);         // 次の位置
                    context.stroke();    
                }
            } else if(obj.key == "selectedComment"){
                var commentID = Number(obj.val.commentID);
                console.log("selectedComment is broadcasted:%d", commentID);
                selectComment(commentID);
            }
        } else if(message.data.constructor === Blob){
            var context = $("canvas").eq(0).get(0).getContext("2d");
            // context.clearRect(0, 0, 700, 500);
            var reader = new FileReader();
            console.log("try");
            reader.onload = function(){
                var img = new Image();
                img.src = reader.result;
                setTimeout(function(){
                    context.drawImage(img, 0, 0);
                },0);
            };
            reader.readAsDataURL(message.data);
        } else{
            alert(message.data.constructor);
        }
    };
    // ws setting

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

    // sync master slide no
    MasterSlideNo.find().observeChanges({
        changed: function(id, fields) {
            if(fields.no !== undefined){
                console.log("MasterSlideNo changed : %d", fields.no);
                if(isMaster() || $("#syncCheck").prop("checked")){
                    $("#notextbox").val(fields.no);
                    setCurrentSlideNo(fields.no);
                }
            }
        }
    });
    // 上と同じようなこと
    Meteor.autorun(function(){
        //console.log("autorun exec"+getMasterSlideNo());
    });

    SlideImgs.find().observe({
        changed: function(newDocument){
            console.log("SlideImgs changed");
            if(newDocument.dataURL == "" ){
                updateCanvas(newDocument.id, newDocument.dataURL);
            }
        },
        added: function(newDocument){
            console.log("SlideImgs added");
            updateCanvas(newDocument.id, newDocument.dataURL);
        }
    });

    Meteor.setInterval(function(){
        Watchers.update(
            {_id: Session.get("user_id")},
            {$set: {last_keepalive: (new Date()).getTime()}}
        );
    }, 1000);
});

// 表示 tempalte helpers
Template.test.helpers({
    test: function(){
        return {
            test: location.hash == "#test",
            gori: "val",
            hage: [{a:"a1"}, {a:"a2"}] 
        };
    }
});
Template.show_info.helpers({
    info : function(){
        console.log("DFSFSDFSDFSDF");
        var slideno = getMasterSlideNo();
        return {
            count: Watchers.find({}).count(),
            masterSlideNo: slideno,
        };
    }
});
Template.checkArea.helpers({
    check: function(){
        return location.hash != "#master";
    }
});
Template.slide.helpers({
    isMaster: function(){
        return location.hash == "#master";
    }
});
Template.opinionsResult.helpers({
    opinions: function(){
        return Opinions.find();
    }
});
Template.resetArea.helpers({
    isMaster: function(){
        return location.hash == "#master";
    }
});
Template.displaySlide.helpers({
    slidesInfo: function(){
        return {
            isMaster: location.hash == "#master",
            slides: [
                {no:0, img:"700x500.jpeg"},
                {no:1, img:"700x500.jpeg"},
                {no:2, img:"700x500.jpeg"},
                {no:3, img:"700x500.jpeg"},
                {no:4, img:"700x500.jpeg"},
                {no:5, img:"700x500.jpeg"},
                {no:6, img:"700x500.jpeg"},
                {no:7, img:"700x500.jpeg"},
                {no:8, img:"700x500.jpeg"},
                {no:9, img:"700x500.jpeg"}
            ]
        }
    }
});
Template.commentsArea.helpers({
    comments: function(){
        return Comments.find({}, {sort: {no: -1}});
    }
});

// イベント
Template.checkArea.events = {
    "change #syncCheck": function(e, template){
        if(isMaster()){
            return ;
        }

        var checked = $("#syncCheck").prop("checked");
        if(checked){
            var no = getMasterSlideNo();
            $("#notextbox").val(no);
            setCurrentSlideNo(no);
            $("#point").css("display", "block");
        } else{
            $("#point").css("display", "none");
        }
    }
};
Template.slide.events = {
    "click #prevButton": function(e, template){
        var current = Number($("#notextbox").val());
        if(current == 0){
            return ;
        }
        current = current - 1;
        $("#notextbox").val(current);
        $("#notextbox").val(current);
        setCurrentSlideNo(current);
    },
    "click #nextButton": function(e, template){
        var current = Number($("#notextbox").val());
        if(current == 9){
            return ;
        }
        current = current + 1;
        $("#notextbox").val(current);
        setCurrentSlideNo(current);
    },
    "click #pageClearButton": function(e, template){
        if(isMaster()){
            var masterno = getCurrentSlideNo();
            console.log("clearPage %d", masterno);
            updateSlideDataURL(masterno, "");
        }
        // CommentCanvasをきれいにする
        var targetCanvas = $(".commentCanvas").eq(getCurrentSlideNo()).get(0);
        updateCanvas(targetCanvas, "");
    },
    "change #notextbox": function(e, template){
        var changed = template.find("#notextbox").value;
        if(isNaN(changed)){
            alert("入力が不正です");
            template.find("#notextbox").value = getCurrentSlideNo();
            return ;
        }
        setCurrentSlideNo(changed);
    }
};
Template.displaySlide.events = {
    "mousemove .masterCanvas": function(e, template){
        if(isMaster()){
            var off = $(e.target).offset();
            var offsetX = e.pageX - off.left; 
            var offsetY = e.pageY - off.top;
            $("#point").css({
                top: offsetY,
                left: offsetX
            });
            
            var obj = {
                key:"slidePoint",
                val:{x: offsetX, y: offsetY}
            };
            g_socket.send(JSON.stringify(obj));
        }
    }
};
Template.opinionsResult.events = {
    'click #goodButton': function(e, template) {
        var id;
        id = Opinions.findOne({name:"good"})._id;
        Opinions.update(
            { _id: id },
            { $inc: {count : 1}}
        );
    },
    'click #badButton': function(e, template) {
        var id;
        id = Opinions.findOne({name:"bad"})._id;
        Opinions.update(
            { _id: id },
            { $inc: {count : 1}}
        );
    }
};
Template.commentsArea.events = {
    "click #commentSubmit": function(e, template){
        var comment = template.find("#commentsArea").value;
        if(comment == ""){
            return ;
        }
        
        var numOfComments = Comments.find().count();
        comment = comment.replace(/\r?\n/g, "<br/>");
        var commentCanvasID = "ccanvas_" + getCurrentSlideNo();
        Comments.insert({
            no: numOfComments,
            comment: comment,
            targetSlideNo: getCurrentSlideNo(),
            targetSlideSnapShot: getCanvasSnapShotURL(commentCanvasID)  
        });
       
        updateCanvas(commentCanvasID, "");
       
        template.find("#commentsArea").value = "";
    }
};
Template.resetArea.events = {
    "click #resetButton": function(){
        var slidenoid = MasterSlideNo.findOne({name:"slideno"})._id;
        MasterSlideNo.update(
            {_id: slidenoid},
            {$set: {no: 0}}
        );

        Opinions.find({}).forEach(function(doc){
            Opinions.update(
                {_id: doc._id},
                {$set: {count: 0}}
            );
        });
        
        Comments.find({}).forEach(function(doc){
            Comments.remove(
                {_id: doc._id}
            );
        });
        
        SlideImgs.find({}).forEach(function(doc){
            var id = doc.id;
            SlideImgs.update(
                {_id: doc._id},
                {$set: {dataURL: ""}}
            );
        });
    }
};

$(function(){
    console.log("DOM Ready");
    if(location.hash == "#master"){
        document.title = "発表者"
    } else{
        document.title = "一般"
    }
    
    g_flipsnap = Flipsnap("#flipsnap");
    g_flipsnap.element.addEventListener("fspointmove", function(a,i){
        $("#notextbox").val(getCurrentSlideNo());
        if(isMaster()){
            setMasterSlideNo(getCurrentSlideNo());
        }
    }, false);

    $(".masterCanvas,.commentCanvas").each(function(el){
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
        // var targetDoc = Comments.findOne({no: commentID});
        // var _id = targetDoc._id;
        // var targetSlideNo = targetDoc.targetSlideNo;
        // var targetSlideSnapShot = targetDoc.targetSlideSnapShot;
        // console.log("jumpSlide with comment:%d targetSlideNo:%d", commentID, targetSlideNo);
        // console.log(targetSlideSnapShot);

        // setCurrentSlideNo(targetSlideNo);
        // if(isMaster()){
            // setMasterSlideNo(targetSlideNo);
        // }
        // var targetCanvas = $(".commentCanvas").eq(targetSlideNo).get(0);
        // // updateCanvas(targetCanvas, "");
        // updateCanvas(targetCanvas, targetSlideSnapShot);
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

