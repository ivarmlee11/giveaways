$(function() {
// $('#updateCards').on('click', function(){
//   updateCards();
// });
var $tradingArea = $('#tradingArea');

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
  var url = '/player/playerListData/' + element;
  $.ajax({
    url: url,
    method: 'GET',
    success: function(playerList) {
      var playerList = playerList,
          users = [];

      playerList.forEach(function(val) {
        users.segments.push({
          username: val.username,
          id: val.id
        });
      });

      gameDropDownList(users);
    }
  });
};

function gameDropDownList(list) {
  var $playerTradeList = $('#playerTradeList');
  $playerTradeList.html('');
  list.forEach(function(val) {
    $playerTradeList.append('<option userid="' + val.id + '">' + val.username + '</option>');  
  });
};

  updateCards();
  updatePlayerList();
});
