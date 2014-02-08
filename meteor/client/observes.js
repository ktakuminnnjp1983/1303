console.log("##### read observes #####");

// sync master slide no
MasterSlideNo.find().observeChanges({
    changed: function(id, fields) {
        console.log("MasterSlideNo changed");
        if(fields.no !== undefined){
            // コメント入力中はスライド同期しない
            if($("#commentsArea").val().length > 0){
                return ;
            }
            if(isMaster() || $("#syncCheck").prop("checked")){
                $("#notextbox").val(fields.no);
                setCurrentSlideNo(fields.no);
            }
        }
    }
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

Comments.find().observe({
    removed: function(oldDocument){
        var no = oldDocument.targetSlideNo;
        var targetCanvas = $(".commentCanvas").eq(no).get(0);
        updateCanvas(targetCanvas, "");
        Session.set("numOfComments", Comments.find().count());
    },
    added: function(newDocument){
        Session.set("numOfComments", Comments.find().count());
    }
});

