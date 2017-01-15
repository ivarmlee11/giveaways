$(function() {
var url = 'window.location.href',
    socket = io.connect(url);

console.log(url)
// socket.on('news', function (data) {
//   console.log(data);
//   socket.emit('my other event', { my: 'data' });
// });
});