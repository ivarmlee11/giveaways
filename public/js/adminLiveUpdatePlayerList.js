$(function() {

  function getPlayerEntries(){
    console.log('update run');
    var giveawayIds = $('.numberOfPlayer').map( function() {
        return $(this).attr('giveawayId');
    }).get();
    console.log(giveawayIds);
    giveawayIds.forEach(function(val) {
      var url = '/admin/playerListData/' + val;
      $.ajax({
        url: url,
        type: 'GET',
        success: function(playerList) {
          $('span[playerNumberId=' + val + ']').text('There are ' + playerList.length + ' entries.');
          if(playerList.length === 1) {
            $('span[giveawayId=' + val + ']').text('There is ' + playerList.length + ' entry.');
          }
          playerList.forEach(function(player) {
            console.log(player)
            console.log('val ' + val)
            $('ul[playerListId=' + val + ']').append('<li>' + player.username + '<img id="logo" src="/img/' + player.auth + '.png" /></li>');
          });
        }
      });
    });
  };

  var getPlayers = getPlayerEntries();
  getPlayerEntries();
  var intervalID = window.setInterval(getPlayers, 5000);
});