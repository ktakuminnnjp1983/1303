console.log("##### read observes #####");

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

Comments.find().observe({
    removed: function(oldDocument){
        var no = oldDocument.targetSlideNo;
        var targetCanvas = $(".commentCanvas").eq(no).get(0);
        updateCanvas(targetCanvas, "");
    }
});

