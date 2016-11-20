$(function() {
  var url = window.location.href;
  url = url.split('/');

  var idx = url[url.length -1];

  $('#selectWinner').on('click', function() {
    var url = '/winner/' + idx;
    var winner;
    $.ajax({
          url: url,
          type: 'GET',
          success: function(players) {
            var playerlist = players.playerList;
            console.log(playerlist)
            console.log(typeof playerlist)
            winner = playerlist[Math.floor(Math.random()*playerlist.length)];
            $('#winner').html('The winner is ' + winner + '!');      
          }
    });
  });

  $('#deleteThis').on('click', function() {
    var url = '/deleteGiveaway/' + idx;
    $.ajax({
          url: url,
          type: 'GET',
          success: function(data) {       
            window.location.href = 'https://tweak-game-temp.herokuapp.com' + url;       
          }
    });
  });
});