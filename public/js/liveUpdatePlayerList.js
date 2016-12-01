$(function() {

  function getPlayerEntries(){
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
          console.log('fuck')
          $('span[playerNumberId=' + val + ']').text('There are ' + playerList.length + ' entries.');
          playerList.forEach(function(player) {
            console.log(player.username);
            $('ul[playerListId=' + val + ']').append('<li>' + player.username + '</li>');
          });
          if(playerList.length === 1) {
            $('span[giveawayId=' + val + ']').text('There is ' + playerList.length + ' entry.');
          }
        }
      });
    });
  };

  getPlayerEntries();

});