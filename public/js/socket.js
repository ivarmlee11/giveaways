$(function() {
  var socket = io.connect('https://tweak-game-temp.herokuapp.com');
    socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });
});