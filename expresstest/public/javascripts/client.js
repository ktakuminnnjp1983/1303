var g_io;

$(function(){
    console.log("### client.js start ###");
    g_io = io.connect(location.host);

    g_io.on("error", function(reason){
        alert(reason);
    });
});
