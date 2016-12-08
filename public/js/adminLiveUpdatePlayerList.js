$(function() {

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var getPlayers = function(){
  var giveawayIds = $('.numberOfPlayer').map( function() {
    return $(this).attr('giveawayId');
  }).get();
  giveawayIds.forEach(function(val) {
    var url = '/admin/playerListData/' + val;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(playerList) {
        console.log('updated');
        $('span[giveawayId=' + val + ']').text('There are ' + playerList.length + ' entries.');
        if(playerList.length === 1) {
          $('span[giveawayId=' + val + ']').text('There is ' + playerList.length + ' entry.');
        }
        $('ul[playerListId=' + val + ']').html('<li></li>');
        // var playerList = checkIps(playerList);
        playerList.forEach(function(player) {
          if(player.numberofips > 1) {
            $('ul[playerListId=' + val + ']').append('<li><strong>' + player.username + '</strong><img id="logo" src="/img/' + player.auth + '.png"/>!</li>');
          } else {
            $('ul[playerListId=' + val + ']').append('<li>' + player.username + '<img id="logo" src="/img/' + player.auth + '.png"/></li>');
          }
        });
      }
    });
  });
};

  getPlayers();   
  setInterval(getPlayers, 10000);
});