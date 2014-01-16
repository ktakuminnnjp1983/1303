console.log("Read client");

function isMaster(){
    return location.hash === "#master";
}
    
Meteor.startup(function() {
    console.log("Client startup");
    Meteor.call("hello", "test");
    var user_id = Watchers.insert(
        {
            last_keepalive: (new Date()).getTime()
        }
    );
    Session.set("user_id", user_id);

    // sync master slide no
    MasterSlideNo.find().observeChanges({
        changed: function(id, fields) {
            console.log("MasterSlideNo changed : %d", fields.no);
            if(isMaster() || $("#syncCheck").prop("checked")){
                $("#notextbox").val(fields.no);
                g_flipsnap.moveToPoint(fields.no);
            }
        }
    });

    Meteor.setInterval(function(){
        Watchers.update(
            {_id: Session.get("user_id")},
            {$set: {last_keepalive: (new Date()).getTime()}}
        );
    }, 1000);
});

// 表示
Template.show_info.info = function(){
    var slideno = getMasterSlideNo();
    return {
        count: Watchers.find({}).count(),
        masterSlideNo: slideno,
    };
}
Template.checkArea.check = function(){
    return {
        val: location.hash != "#master"
    };
}
Template.opinionsResult.opinions = function(){
    var cursor = Opinions.find();
    return cursor;
}
Template.resetArea.isAdmin = function(){
    return {
        val: location.hash == "#master"
    };
}

// イベント
Template.checkArea.events = {
    "change #syncCheck": function(e, template){
        if($("#syncCheck").prop("checked")){
            var no = getMasterSlideNo();
            $("#notextbox").val(no);
            g_flipsnap.moveToPoint(no);
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
        g_flipsnap.moveToPoint(current);
    },
    "click #nextButton": function(e, template){
        var current = Number($("#notextbox").val());
        if(current == 9){
            return ;
        }
        current = current + 1;
        $("#notextbox").val(current);
        g_flipsnap.moveToPoint(current);
    },
    "change #notextbox": function(e, template){
        var changed = template.find("#notextbox").value;
        if(isNaN(changed)){
            alert("入力が不正です");
            template.find("#notextbox").value = g_flipsnap.currentPoint;
            return ;
        }
        g_flipsnap.moveToPoint(changed);
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
    }
};

$(function(){
    console.log("DOM Ready");
    if(location.hash == "#master"){
        document.title = "発表者"
    } else{
        document.title = "一般"
    }
    
    g_flipsnap = Flipsnap(".flipsnap");
    g_flipsnap.element.addEventListener("fspointmove", function(a,i){
        $("#notextbox").val(g_flipsnap.currentPoint);
        if(isMaster()){
            setMasterSlideNo(g_flipsnap.currentPoint);
        }
    }, false);
});

