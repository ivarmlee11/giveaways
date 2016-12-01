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
          $('span[giveawayId=' + val + ']').text('There are ' + playerList.length + ' entries.');
          playerList.forEach(function(val) {
            $('#playersList').append('<li>' + val + '</li>');
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