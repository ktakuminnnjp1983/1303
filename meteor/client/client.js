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

function updateCanvas(canvas, dataURL){
    if(!canvas){
        alert("argError");
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
function getCanvasSnapShotURL(canvas){
    var type = 'image/png';
    return canvas.toDataURL(type);
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
                    var lineWidth;
                    if(obj.val.mode == "pen"){
                        context.globalCompositeOperation = "source-over";
                        lineWidth = 5;
                    } else{
                        context.globalCompositeOperation = "destination-out";
                        lineWidth = 10;
                    }
                    context.beginPath();             // パスのリセット
                    context.lineWidth = lineWidth;           // 線の太さ
                    context.strokeStyle="#ff0000";   // 線の色
                    context.moveTo(px, py);           // 開始位置
                    context.lineTo(x, y);         // 次の位置
                    context.stroke();    
                }
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
            if(fields.point !== undefined){
                if($("#syncCheck").prop("checked")){
                    var off = $("#viewport").offset();
                    $("#point").css({
                        top: off.top + fields.point.y,
                        left: off.left + fields.point.x
                    });
                } 
            }
            if(fields.no !== undefined){
                console.log("MasterSlideNo changed : %d", fields.no);
                if(isMaster() || $("#syncCheck").prop("checked")){
                    $("#notextbox").val(fields.no);
                    g_flipsnap.moveToPoint(fields.no);
                }
            }
        }
    });
    // 上と同じようなこと
    Meteor.autorun(function(){
        //console.log("autorun exec"+getMasterSlideNo());
    });

    SlideImgs.find().observe({
        changed: function(newDocument, oldDocument){
            console.log("SlideImgs changed");
            showObj(newDocument);
            updateCanvas($("canvas").eq(newDocument.no).get(0), newDocument.dataURL);
        },
        added: function(newDocument){
            console.log("SlideImgs added");
            updateCanvas($("canvas").eq(newDocument.no).get(0), newDocument.dataURL);
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
            g_flipsnap.moveToPoint(no);
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
        g_flipsnap.moveToPoint(current);
    },
    "click #nextButton": function(e, template){
        var current = Number($("#notextbox").val());
        if(current == 9){
            return ;
        }
        current = current + 1;
        $("#notextbox").val(current);
        g_flipsnap.moveToPoint(current);
    },
    "change #notextbox": function(e, template){
        var changed = template.find("#notextbox").value;
        if(isNaN(changed)){
            alert("入力が不正です");
            template.find("#notextbox").value = g_flipsnap.currentPoint;
            return ;
        }
        g_flipsnap.moveToPoint(changed);
    }
    
};
Template.displaySlide.events = {
    "mousemove .item": function(e, template){
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
        Comments.insert({
            no: numOfComments+1,
            comment: comment
        })
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
        $("#notextbox").val(g_flipsnap.currentPoint);
        if(isMaster()){
            setMasterSlideNo(g_flipsnap.currentPoint);
        }
    }, false);

    $("canvas").each(function(el){
        this.width = 700;
        this.height = 500;
        if(isMaster() == false){
            return true;
        }

        $(this).mousemove(function(e){
            var context = this.getContext("2d");
            if(getSlideMode() == "slide"){
                return true;
            }
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
                context.beginPath();             // パスのリセット
                context.lineWidth = getSlideMode() == "erase" ? 10 : 5;           // 線の太さ
                context.strokeStyle="#ff0000";   // 線の色
                context.moveTo(startX, startY);           // 開始位置
                context.lineTo(x, y);         // 次の位置
                context.stroke();    
            }    
            $.data(this, "px", x);
            $.data(this, "py", y);

            e.stopPropagation();
        });
        $(this).mousedown(function(e){
            var context = this.getContext("2d");
            if(getSlideMode() == "erase"){
                context.globalCompositeOperation = "destination-out";
            } else{
                context.globalCompositeOperation = "source-over";
            }
            $.data(this, "mousedowning", true);
        });
        $(this).mouseup(function(e){
            var id = e.target.id;
            var snapshotURL = getCanvasSnapShotURL(e.target);
            var _id = SlideImgs.findOne({id: id})._id;
            SlideImgs.update(
                {_id: _id},
                {
                    $set: {
                        dataURL: snapshotURL
                    }
                }
            );
            $.data(this, "mousedowning", false);
            this.getContext("2d").globalCompositeOperation = "source-over";
        });
        $(this).mouseleave(function(e){
            $.data(this, "px", null);
            $.data(this, "py", null);
            $.data(this, "mousedowning", false);
            this.getContext("2d").globalCompositeOperation = "source-over";
        });
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

