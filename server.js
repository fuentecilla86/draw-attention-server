// system
var path = require('path');

// server.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//keep track of switchState
var switchState = false;
//keep is raspberrypi is connected or not
var raspberrypi = false;
//clients Connected
var allClients = [];

// Views with pug
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

//index.html file
app.get('', function(req, res,next) {
    var defaultSwitchState = switchState ? 'checked' : '';
    var defaultSwitchStateText = switchState ? 'ON' : 'OFF';
    var defaultRaspberrypiState = raspberrypi ? 'online' : 'offline';

    res.render("index", {
        switchStateInitValue: defaultSwitchState,
        switchStateInitValueText: defaultSwitchStateText,
        raspberrypiState: defaultRaspberrypiState
    });
});

io.on('connection', function(client) {

  allClients.push(client);

  //when the server receives switched event, do this
  client.on('ledStatus', function(state) {
    switchState = state;
    //send a message to ALL connected clients
    io.emit('switchUpdate', state);
  });

  client.on('send-nickname', function(nickname) {
    if (nickname === 'raspberrypi') {
      raspberrypi = true
      console.log(nickname + ' connected');
      //keep nickname for check who has been disconnected
      client.nickname = nickname
      // emit to all sockets
      io.emit('send-nickname', 'raspberrypi');
    }
  });

  client.on('disconnect', function() {
    if (client.nickname === 'raspberrypi') {
      console.log(client.nickname + ' disconnected')
      raspberrypi = false
      //send a message to ALL connected clients
      io.emit('raspberrypi-disconnected');
    }
    var i = allClients.indexOf(client);
    allClients.splice(i, 1);
  });

});

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
})
