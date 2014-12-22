var io = require("socket.io")();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var argv = require("argv");
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var cookie = require('cookie');

var myutil = require('./mod/myutil');

// router
var routes = require('./routes/index');
var users = require('./routes/users');

// const
var SESSKEY = "sessID";
var SECRET = "kobayashi_secret";

// original
var sslmode = false;

argv.option({
    name: 'ssl',
    short: 's',
    type : 'string',
    description :'Enable SSL',
    example: "'script -s'"
});

if(argv.run().options.ssl || process.env.SECURE){
    console.log("SSL-Mode");
    sslmode = true;
} else{
    console.log("NORMAL-Mode");
}

console.log("dirname[%s], filename[%s]", __dirname, __filename);
var Test = require("./mod/testmod"); 
var test = new Test("test");
console.log("%s", test.teststr);

// var redis = require("socket.io-redis");
// io.adapter(redis({host: "localhost", port: 6379}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middlewares
// uncomment after placing your favicon in /public/images
app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var redisStore = new RedisStore({
    host: "127.0.0.1",
    port: 6379
});
app.use(cookieParser(SECRET));
app.use(session({
    name: SESSKEY,
    secret: SECRET,
    store: redisStore,
    cookie: {httpOnly: false}
}));

app.use(function(req, res, next){
    console.log("mymiddleware");
    next();
});

app.use("/", function(req, res, next) {
    console.log("mymiddleware");
    next();
});

// routers
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

var server;
if(sslmode){
    var https = require('https');
    var fs = require('fs');
    var opts = {
        key: fs.readFileSync("./server.key"),
        cert: fs.readFileSync("./server.crt")
    };
    server = https.createServer(opts, app);
    app.set("port", process.env.PORT || 4443);
    io.attach(server, {'log level': 2, secure: true});
} else{
    var http = require('http');
    server = http.createServer(app);
    app.set("port", process.env.PORT || 3000);
    io.attach(server, {'log level': 2});
}

server.listen(app.get("port"), function(){
    console.log("listen %s", app.get("port"));
});

// app.get("env")には環境変数 NODE_ENVが設定される
// defaultはdevelopment

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function setSession(sessID, key, val){
    redisStore.get(sessID, function(err, session){
        if(err){
            console.log("eeee %s %s", err, session);
        } else{
            console.log("oooo %s %s", err, session);
            session[key] = val;

            redisStore.set(sessID, session, function(err, res){
                if(err){
                    console.log("EEEE");
                } else{
                    console.log("OOOO", err, res);
                }
            });
        }
    });
}

// http://jxck.hatenablog.com/entry/20110809/1312847290
io.use(function(socket, next){
    console.log("##### authorization #####");
    
    var targetCookie = cookie.parse(decodeURIComponent(socket.handshake.headers.cookie))
    var sessID = require("cookie-parser/lib/parse").signedCookies(targetCookie, "kobayashi_secret")[SESSKEY];
    if(!sessID){
        next(new Error("auth error"));
        return ;
    }
    console.log("sessID[%s]", sessID);
    socket.handshake.sessID = sessID;

    setSession(sessID, "hoge", "gooooooooooooo");
    console.log("setsession t");

    next();
});

io.sockets.on("connection", function (socket) {
    console.log("##### connection #####");
    console.log(io.origins());
    console.log("connection sessID[%s], sockID[%s]", socket.handshake.sessID, socket.id);

    socket.on("disconnect", function(){
        console.log("##### disconnect #####");
        var sessID = socket.handshake.sessID;
        console.log("disconnect sessID[%s], sockID[%s]", socket.handshake.sessID, socket.id);
    });
    
    socket.on("enter", function(callback){
        callback(socket.id);
    });
    socket.on("sound", function(sound){
        // console.log(sound);
        io.emit("soundret", sound);
    });
});


// rpc
var dnode = require('dnode');
var dserver = dnode({
    test: function(str, callback){
        console.log(str);
        callback(str);
    }
});
dserver.listen(5004);

//binaryserver
var binaryServer = require("binaryjs").BinaryServer;
var bs = binaryServer({port: 9001});

var soundStreams = {};
var clients = {};
bs.on("connection", function(client){
    console.log("BinaryConnection STAAAAAAAAAAAAAAAAAART");
    client.on("stream", function(stream, meta){
        console.log("BinaryConnection get stream type[%s] id[%s]", meta.type, meta.id);
        clients[meta.id] = client;
        client.myid = meta.id;
        if(meta.type == "sound"){
            console.log("sound");
            soundStreams[meta.id] = stream;
            stream.on("data", function(chunk){
                // console.log(chunk.length);
                // client.send(chunk);
            });
        } else if(meta.type == "listen"){
            console.log("listen");
            for(var id in soundStreams){
                console.log(id);
                soundStreams[id].pipe(stream);
            }
        }
        stream.on("close", function(){
            console.log("stream closed");
        });
    });
    client.on("close", function(){
        console.log("BinaryConnection CLOOOOOOOOOOOOOOSE");
    });
    
    // var file = fs.createReadStream("./wavfiles/all_5_Auditor\ User_143_1_1418032842946.wav");
    // client.send(file);
});


module.exports = app;
