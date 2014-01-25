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

showObj = function(obj){
    for(var prop in obj){
        console.log(prop + " " + obj[prop]);
    }
}

