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
        winner = playerlist[Math.floor(Math.random()*playerlist.length)];
        if(winner) {
          $('#winner').html('The winner is ' + winner + '!');
        } else {
          $('#winner').html('Nobody has joined the competition yet!');
        } 
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