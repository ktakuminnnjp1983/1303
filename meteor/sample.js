console.log("##### Read common #####");

// 共通methods
getMasterSlideNo = function(){
    var no = 0;
    var doc = MasterSlideNo.findOne()
    if(doc){
        no = doc.no;
    }
    return no;
}

setMasterSlideNo = function(no){
    var _id;
    var doc = MasterSlideNo.findOne();
    if(doc){
        _id = doc._id;
        MasterSlideNo.update({_id: _id}, {$set:{no: no}})
    }
}

showObj = function(obj){
    for(var prop in obj){
        console.log(prop + " " + obj[prop]);
    }
}

if(Meteor.isServer){
    console.log("##### common isServer #####");
}

if(Meteor.isClient){
    console.log("##### common isClient #####");
}
