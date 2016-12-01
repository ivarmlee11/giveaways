$(function() {
  var url = window.location.href;

  url = url.split('/');

  var idx = url[url.length -1];

  $('#selectWinner').on('click', function() {
    var url = '/admin/playerListData/' + idx;
    var winner;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(players) {
        var playerList = players;
        winner = playerList[Math.floor(Math.random()*playerList.length)];
        if(winner) {
          $('#winner').html('The winner is ' + winner + '!');
        } else {
          $('#winner').html('Nobody has joined the competition yet!');
        } 
      }
    });
  });
  
});