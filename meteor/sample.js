console.log("Read common");

// var を付けない、またFunctionObjectを使うことでclient, server両方から利用できるようになる
// 正しい用法かは不明。
Watchers = new Meteor.Collection("watchers");
Opinions = new Meteor.Collection("opinions");
MasterSlideNo = new Meteor.Collection("masterSlideNo");
Comments = new Meteor.Collection("comments");
SlideImgs = new Meteor.Collection("slideImgs");

// 共通methods
getMasterSlideNo = function(){
    var no = 0;
    var doc = MasterSlideNo.findOne({name:"masterSlideNo"})
    if(doc){
        no = doc.no;
    }
    return no;
}

setMasterSlideNo = function(no){
    var id;
    var doc = MasterSlideNo.findOne({name:"masterSlideNo"})
    if(doc){
        id = doc._id;
    }
    MasterSlideNo.update({_id:id}, {$set:{no:no}})
}

showObj = function(obj){
    for(var prop in obj){
        console.log(prop + " " + obj[prop]);
    }
}

if(Meteor.isServer){
    console.log("common isServer");
}

if(Meteor.isClient){
    console.log("common isClient");
}
