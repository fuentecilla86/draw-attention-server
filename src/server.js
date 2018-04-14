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

// Views with ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Static content
app.use(express.static(__dirname + '/public'));

//index.html file
app.get('', function(req, res,next) {
    var defaultSwitchState = switchState ? 'checked' : '';
    var defaultSwitchStateText = switchState ? 'ON' : 'OFF';
    var defaultSwitchStateColour = switchState ? 'text-success' : 'text-danger';
    var defaultRaspberrypiState = raspberrypi ? 'online' : 'offline';
    var defaultRaspberrypiColourState = raspberrypi ? 'text-success' : 'text-danger';
    var defaultRaspberrypiDisplayState = raspberrypi ? 'inline' : 'none';

    res.render("index", {
        switchStateInitValue: defaultSwitchState,
        switchStateInitValueText: defaultSwitchStateText,
        switchStateInitColour: defaultSwitchStateColour,
        raspberrypiState: defaultRaspberrypiState,
        raspberrypiColourState: defaultRaspberrypiColourState,
        raspberrypiDisplayState: defaultRaspberrypiDisplayState
    });
});

io.on('connection', function(client) {

  allClients.push(client);

  //when the server receives switched event, do this
  client.on('led-status', function(state) {
    // console.log("led status " + state)
    switchState = state;
    //send a message to ALL connected clients
    io.emit('switch-update', state);
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
server.listen(3001, function(){
  console.log('listening on *:3001');
})
