console.log("##### Read common #####");
// Server, Client共通

Watchers = new Meteor.Collection("watchers");
Opinions = new Meteor.Collection("opinions");
MasterSlideNo = new Meteor.Collection("masterSlideNo");
Comments = new Meteor.Collection("comments");
SlideImgs = new Meteor.Collection("slideImgs");

getMasterSlideNo = function(){
    var doc = MasterSlideNo.findOne();
    if(doc){
        return doc.no;
    } else{
        return 0;
    }
}

setMasterSlideNo = function(no){
    var doc = MasterSlideNo.findOne();
    if(!doc){
        return false;
    }
    var _id = MasterSlideNo.findOne()._id
    MasterSlideNo.update({_id: _id}, {$set: {no: no}})
}

getFilterdCommentCursor = function(filter){
    var cursor;
    if(filter == "all"){
        cursor =  Comments.find({}, {sort: {no: -1}});
    } else{
        targetPage = Number(filter);
        cursor = Comments.find({targetSlideNo: targetPage}, {sort: {no: -1}});
    }
    
    console.log("filteredCommentCursorCount:" + cursor.count());
    return cursor;
}

showObj = function(obj){
    for(var prop in obj){
        console.log(prop + " " + obj[prop]);
    }
}

