//app.js
var express = require('express');
var app = express();
var serv = require('http').Server(app);
 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/game.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(2000);
console.log("Server started.");
 
var SOCKET_LIST = {};
var PLAYERS_LIST = {};
 
 
class Player {
    constructor(id, playerName){
        this.id = id;
        this.playerName =  playerName;
    }
}



function onDisconnect(socket){
    delete Player.list[socket.id];
}


var DEBUG = true;
 
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    //Definit un id pour le socket et instancie un joueur
    socket.id = Math.random();
    const joueur = new Player(socket.id, "User_" + ("" + socket.id).slice(2,7));

    PLAYERS_LIST[socket.id] = joueur;
    SOCKET_LIST[socket.id] = socket;
   
    //Deconnection
    socket.on('disconnect',function(){
        delete PLAYERS_LIST[socket.id];
        delete SOCKET_LIST[socket.id];
    });

    //Quand le serveur recois un message CHAT
    socket.on('sendMsgToServer',function(data){
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat', PLAYERS_LIST[socket.id].playerName + ': ' + data);
        }
    });
    
    //Pour la fonction debug
    socket.on('evalServer',function(data){
        if(!DEBUG)
            return;
        var res = eval(data);
        socket.emit('evalAnswer',res);     
    });

    //Recois un nouveau pseudo
    socket.on('sendNickname', function(data){
        console.log("Nom recu: " + data);
        PLAYERS_LIST[socket.id].playerName = data;
    });
   
   
   
});
