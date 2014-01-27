console.log("##### read helpers #####");

Template.test.helpers({
    test: function(){
    console.log("$$$ helper %s $$$", "test");
        return {
            test: location.hash == "#test",
            gori: "val",
            hage: [{a:"a1"}, {a:"a2"}] 
        };
    }
});
Template.show_info.helpers({
    info : function(){
        console.log("$$$ helper %s $$$", "show_info");
        var slideno = getMasterSlideNo();
        return {
            count: Watchers.find({}).count(),
            masterSlideNo: slideno,
        };
    }
});
Template.checkArea.helpers({
    check: function(){
        console.log("$$$ helper %s $$$", "checkArea");
        return location.hash != "#master";
    }
});
Template.slide.helpers({
    isMaster: function(){
        console.log("$$$ helper %s $$$", "slide");
        return location.hash == "#master";
    }
});
Template.opinionsResult.helpers({
    opinions: function(){
        console.log("$$$ helper %s $$$", "opinionsResult");
        return Opinions.find();
    }
});
Template.resetArea.helpers({
    isMaster: function(){
        console.log("$$$ helper %s $$$", "resetArea");
        return location.hash == "#master";
    }
});
Template.displaySlide.helpers({
    slidesInfo: function(){
        console.log("$$$ helper %s $$$", "displaySlide");
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
        console.log("$$$ helper %s $$$", "commentsArea");
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

