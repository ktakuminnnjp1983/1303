function setMasterSlideNo(no){
    var id;
    var doc = MasterSlideNo.findOne({name:"slideno"})
    if(doc){
        id = doc._id;
    }
    MasterSlideNo.update({_id:id}, {$set:{no:no}})
}
function isMaster(){
    return location.hash === "#master";
}

$(function(){
    g_flipsnap = Flipsnap(".flipsnap");
    g_flipsnap.element.addEventListener("fspointmove", function(a,i){
        $("#notextbox").val(g_flipsnap.currentPoint);
        if(isMaster()){
            setMasterSlideNo(g_flipsnap.currentPoint);
        }
    }, false);

    // $("#resetButton").click(function(){
        // var slidenoid = MasterSlideNo.findOne({name:"slideno"})._id;
        // MasterSlideNo.update(
            // {_id: slidenoid},
            // {$set: {no: 0}}
        // );

        // Opinions.find({}).forEach(function(doc){
            // Opinions.update(
                // {_id: doc._id},
                // {$set: {count: 0}}
            // );
        // });
    // });
});

