var http = require("http");
var fs = require("fs");
var url = require("url");

function showInfo(obj, recursive){
    for(var p in obj){
        if(typeof obj[p] != "function"){
            if(recursive && typeof obj[p] == "object"){
                console.log("## " +  p + "  object ##");
                showInfo(obj[p]);
                console.log("## ##");
            } else{
                console.log(p + " " + obj[p]);
            }
        }
    }
}

var port = process.env.VMC_APP_PORT || 9000;
var server = http.createServer(function(req, res) {
    var parseURL = url.parse(req.url, true);
    if(req.method == "POST" && parseURL.pathname == "/echofile/"){
        var body = "";
        req.on("data", function(data){
            body += data;
        });
        req.on("end", function(){
            console.log(body);
            var i = body.indexOf("=");
            body = body.slice(i+1);
            body = body.replace(/\+/g, "%20");
            console.log(body);
            body = decodeURIComponent(body);
            console.log(body);
            var b = new Buffer(body, "utf8");
            res.writeHead(200, {
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Expires:": "-1",
                "Content-Type": "application/octet-stream; charset=UTF-8",
                "Content-Disposition": 'attachment; filename="save.txt"',
                "Content-Length": b.length
            });
            res.end(body);
        });
    } else{
        res.writeHead(200, {"Content-Type":"text/html"});
        var output = "test";
        res.end(output);
    }
}).listen(port);

console.log("open app port " + port);

