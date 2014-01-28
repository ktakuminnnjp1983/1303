console.log("##### read clientcommon #####");
var g_socket = null;

var Watchers = new Meteor.Collection("watchers");
var Opinions = new Meteor.Collection("opinions");
var MasterSlideNo = new Meteor.Collection("masterSlideNo");
var Comments = new Meteor.Collection("comments");
var SlideImgs = new Meteor.Collection("slideImgs");

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
    Session.set("currentSlideNo", no);
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

