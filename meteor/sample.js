Watchers = new Meteor.Collection("watchers");
Opinions = new Meteor.Collection("opinions");
MasterSlideNo = new Meteor.Collection("masterSlideNo");

function isMaster(){
    return location.hash === "#master";
}

(function() {
    'use strict';
    
    // 共通methods
    function getMasterSlideNo(){
        var no = 0;
        var doc = MasterSlideNo.findOne({name:"slideno"})
        if(doc){
            no = doc.no;
        }
        return no;
    }

    function setMasterSlideNo(no){
        var id;
        var doc = MasterSlideNo.findOne({name:"slideno"})
        if(doc){
            id = doc._id;
        }
        MasterSlideNo.update({_id:id}, {$set:{no:no}})
    }

    function showObj(obj){
        for(var prop in obj){
            console.log(prop + " " + obj[prop]);
        }
    }

    if (Meteor.isClient) {
        Meteor.startup(function() {
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
            
            if(location.hash == "#master"){
                document.title = "発表者"
            } else{
                document.title = "一般"
            }
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
    }
    
    if (Meteor.isServer) {
        Meteor.startup(function () {
            Watchers.remove({});
            MasterSlideNo.remove({});
            Opinions.remove({});

            Meteor.onConnection(function(connection){
                console.log("Connection id[%s]", connection.id);
            });

            MasterSlideNo.insert({no: 0, name:"slideno"});
            console.log("MasterSldeNo:%d", getMasterSlideNo());
          
            Meteor.setInterval(function(){
                Watchers.remove({last_keepalive: {$lt: (new Date()).getTime() - 4000}});
            }, 1000);

            var opinions = [
                { name: "good", count: 0 },
                { name: "bad", count: 0 }
            ];
            opinions.forEach(function(op){
                Opinions.insert(op);
            });
        });
    }
})();
