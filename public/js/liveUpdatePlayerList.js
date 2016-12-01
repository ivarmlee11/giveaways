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
          console.log(playerList);
          cosnole.log(playerList.length);
          $('span[giveawayId=' + val + ']').text('There are ' + playerList.length + ' entries.');

        }
      });
    });
  };

  getPlayerEntries();

});