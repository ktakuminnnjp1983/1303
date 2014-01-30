console.log("##### Read common #####");

peerPortnum = 9000;
peerServerKey = "peerjs";

// 共通methods
function getMasterSlideNo(){
    var no = 0;
    var doc = MasterSlideNo.findOne()
    if(doc){
        no = doc.no;
    }
    return no;
}

function setMasterSlideNo(no){
    var _id;
    var doc = MasterSlideNo.findOne();
    if(doc){
        _id = doc._id;
        MasterSlideNo.update({_id: _id}, {$set:{no: no}})
    }
}

function showObj(obj){
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
