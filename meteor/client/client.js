console.log("Read client");

function isMaster(){
    return location.hash === "#master";
}

function updatePoint(x, y){
    var id;
    var doc = MasterSlideNo.findOne({name:"slideno"})
    if(doc){
        id = doc._id;
    }

    MasterSlideNo.update({_id:id}, {$set:{point:{x:x,y:y}}})
}
    
Meteor.startup(function() {
    console.log("Client startup");
    
    Meteor.subscribe("watchers");
    Meteor.subscribe("masterSlideNo");
    Meteor.subscribe("opinions");
    Meteor.subscribe("comments");

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
            if(fields.point !== undefined){
                if($("#syncCheck").prop("checked")){
                    $("#point").css({
                        top: fields.point.y,
                        left: fields.point.x
                    });
                } 
            }
            if(fields.no !== undefined){
                console.log("MasterSlideNo changed : %d", fields.no);
                if(isMaster() || $("#syncCheck").prop("checked")){
                    $("#notextbox").val(fields.no);
                    g_flipsnap.moveToPoint(fields.no);
                }
            }
        }
    });
    // 上と同じようなこと
    Meteor.autorun(function(){
        //console.log("autorun exec"+getMasterSlideNo());
    });

    Meteor.setInterval(function(){
        Watchers.update(
            {_id: Session.get("user_id")},
            {$set: {last_keepalive: (new Date()).getTime()}}
        );
    }, 1000);
});

// 表示 tempalte helpers
Template.test.helpers({
    test: function(){
        return {
            test: location.hash == "#test",
            gori: "val",
            hage: [{a:"a1"}, {a:"a2"}] 
        };
    }
});
Template.show_info.helpers({
    info : function(){
        var slideno = getMasterSlideNo();
        return {
            count: Watchers.find({}).count(),
            masterSlideNo: slideno,
        };
    }
});
Template.checkArea.helpers({
    check: function(){
        return location.hash != "#master";
    }
});
Template.opinionsResult.helpers({
    opinions: function(){
        return Opinions.find();
    }
});
Template.resetArea.helpers({
    isAdmin: function(){
        return location.hash == "#master";
    }
});
Template.displaySlide.helpers({
    slides: function(){
        return [{no:0},{no:1},{no:2},{no:3},{no:4},{no:5},{no:6},{no:7},{no:8},{no:9}];
    }
});
Template.commentsArea.helpers({
    comments: function(){
        return Comments.find({}, {sort: {no: -1}});
    }
});

// イベント
Template.checkArea.events = {
    "change #syncCheck": function(e, template){
        if(isMaster()){
            return ;
        }

        var checked = $("#syncCheck").prop("checked");
        if(checked){
            var no = getMasterSlideNo();
            $("#notextbox").val(no);
            g_flipsnap.moveToPoint(no);
            $("#point").css("display", "block");
        } else{
            $("#point").css("display", "none");
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
Template.displaySlide.events = {
    "mousemove .item": function(e, template){
        if(isMaster()){
            $("#point").css({
                top: e.offsetY,
                left: e.offsetX
            });
            updatePoint(e.offsetX, e.offsetY);
        }
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
Template.commentsArea.events = {
    "click #commentSubmit": function(e, template){
        var numOfComments = Comments.find().count();
        var comment = template.find("#commentsArea").value;
        comment = comment.replace(/\r?\n/g, "<br/>");
        Comments.insert({
            no: numOfComments+1,
            comment: comment
        })
        template.find("#commentsArea").value = "";
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
        
        Comments.find({}).forEach(function(doc){
            Comments.remove(
                {_id: doc._id}
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
    
    g_flipsnap = Flipsnap("#flipsnap");
    g_flipsnap.element.addEventListener("fspointmove", function(a,i){
        $("#notextbox").val(g_flipsnap.currentPoint);
        if(isMaster()){
            setMasterSlideNo(g_flipsnap.currentPoint);
        }
    }, false);
});

