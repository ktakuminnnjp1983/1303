portnum = 9000;
peerServerKey = "peerjs";

if (Meteor.isClient) {
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        var PeerServer = Meteor.require('peer').PeerServer;
        var server = new PeerServer({ port: portnum, key: peerServerKey, debug:3 });
    });
}
