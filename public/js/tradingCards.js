$(function() {

var $tradingArea = $('#tradingArea'),
    playerInfo;

$('#playerDropDown').on('click', function() {
  $('#player').html($(this).val());
  var userId = $('option:selected', this).attr('userid');
  playerInfo = {
    name: $(this).val(),
    gameId: null,
    userId: parseInt(userId) 
  };
  console.log(playerInfo)
});

$('#tradeWindowIn').droppable( {
  drop: function(event, ui){
    // playerInfo.gameId = 
    console.log($(this).attr('gameId'))
    console.log(playerInfo)
}
});

function updateCards() {
  var url = '/game/winnerCard/'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      cardList.forEach(function(val) {
        $tradingArea.append('<div gameId="' + val.id + '" class="cards">' + 
          '<h3>' + val.name + '</h3>' + 
          '</div>'
        )
      });
      $('.cards').draggable({
        stack: '.cards'
      });
    }
  });
};

function updatePlayerList() {
  var url = '/player/allplayers/';
  $.ajax({
    url: url,
    method: 'GET',
    success: function(playerList) {
      var playerList = playerList,
          users = [],
          $playerTradeList = $('#playerTradeList');

      playerList.forEach(function(val) {
        users.push({
          username: val.username,
          id: val.id
        });
      });

      $playerTradeList.html('');
      users.forEach(function(val) {
        $playerTradeList.append('<option userid="' + val.id + '">' + val.username + '</option>');  
      });
    }
  });
};


updateCards();
updatePlayerList();
});
