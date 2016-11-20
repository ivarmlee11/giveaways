$(function() {

  $.ajax({
    url: '/giveawayHistory',
    type: 'GET',
    success: function(players) {
      console.log(players);
      players.forEach(player) {
        $('#winBox').append('<h6>' + player + '</h6>');
      };
    }
  });
};