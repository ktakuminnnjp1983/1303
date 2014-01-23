console.log("Read client");

var g_socket = null;
var g_canvasStrokes = {};

function isMaster(){
    return location.hash === "#master";
}

function updatePoint(x, y){
    var id;
    var doc = MasterSlideNo.findOne({name:"slideno"})
    if(doc){
        id = doc._id;
    }

    MasterSlideNo.update({_id:id}, {$set:{point:{x:x,y:y}}})
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
                    console.log("%s(%d, %d)->(%d, %d)", id, px, py, x, y);
                }
            }
        }
    };
    // ws setting

    Meteor.subscribe("watchers");
    Meteor.subscribe("masterSlideNo");
    Meteor.subscribe("opinions");
    Meteor.subscribe("comments");

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
            slides: [{no:0},{no:1},{no:2},{no:3},{no:4},{no:5},{no:6},{no:7},{no:8},{no:9}]
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
            
            // updatePoint(offsetX, offsetY);
            
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
    }
};

var g_mode = "slide";
var g_lineWidth;
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

    $("input[name=selectMode]:radio").change(function(e){
        g_mode = this.value;
        if(g_mode === "erase"){
            $("canvas").each(function(){
                var context = this.getContext("2d");
                context.globalCompositeOperation = "destination-out";
                g_lineWidth = 10;
            });
        } else{
            $("canvas").each(function(){
                var context = this.getContext("2d");
                context.globalCompositeOperation = "source-over";
                g_lineWidth = 5;
            });
        }
    });

    $("canvas").each(function(el){
        this.width = 700;
        this.height = 500;
        var context = this.getContext("2d");
        // var img = new Image();
        // img.src = "/imgs/700x500.jpeg";
        // img.onload = function(){
            // context.drawImage(img, 0, 0);
        // }

        $(this).mousemove(function(e){
            if(isMaster() == false){
                return true;
            }
            if(g_mode == "slide"){
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
                var context = this.getContext("2d");
                context.beginPath();             // パスのリセット
                context.lineWidth = g_lineWidth;           // 線の太さ
                context.strokeStyle="#ff0000";   // 線の色
                context.moveTo(startX, startY);           // 開始位置
                context.lineTo(x, y);         // 次の位置
                context.stroke();    
                
                var obj ={
                    key: "canvasStroke",
                    val: {
                        id: $(this).attr("id"),
                        x: x,
                        y: y,
                        mode: g_mode 
                    }
                };
                g_socket.send(JSON.stringify(obj));
            }    
            $.data(this, "px", x);
            $.data(this, "py", y);

            e.stopPropagation();
        });
        $(this).mousedown(function(e){
            $.data(this, "mousedowning", true);
        });
        $(this).mouseup(function(e){
            $.data(this, "mousedowning", false);
            var obj ={
                key: "canvasStroke",
                val: {
                    id: $(this).attr("id"),
                    x: -1,
                    y: -1
                }
            };
            g_socket.send(JSON.stringify(obj));
        });
        $(this).mouseleave(function(e){
            $.data(this, "px", null);
            $.data(this, "py", null);
            $.data(this, "mousedowning", false);
            var obj ={
                key: "canvasStroke",
                val: {
                    id: $(this).attr("id"),
                    x: -1,
                    y: -1
                }
            };
            g_socket.send(JSON.stringify(obj));
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

