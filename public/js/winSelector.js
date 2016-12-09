$(function() {
  var url = window.location.href;

  url = url.split('/');

  var idx = url[url.length -1];

  var winner,
      winnerReset = false;

  $('#selectWinner').on('click', function() {
    var url = '/admin/playerListData/' + idx;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(players) {
        var playerList = players;
        winner = playerList[Math.floor(Math.random()*playerList.length)];
        if(winner) {
          winnerReset = true;
          $('#winner').html('The winner is ' + winner.username + '!');
        } else {
          $('#winner').html('Nobody has entered the competition yet!');
        } 
      }
    });
  });

  $('#addWinnerToDb').on('click', function() {
    var url = '/addToWinHistory/' + idx;
    console.log(winner);
    if(winnerReset) {
      $.ajax({
        url: url,
        type: 'POST',
        data: winner,
        success: function(data) {
          winnerReset = false
          $('#winner').html('Winner added.');
        }
      });
    } else {
      $('#winner').html('The winner has not been drawn or nobody has entered the competition yet!');
    }
  });
});