$(function() {

var $tradingArea = $('#tradingArea'),
    tradeInfoOut = {},
    tradeInfoIn = {};

$('#playerDropDown').on('click', function() {
  $('#playerOut').html($(this).val());
  var userId = $('option:selected', this).attr('userid');
  tradeInfoOut = {
    name: $(this).val(),
    gameId: [],
    userId: parseInt(userId) 
  };
  console.log(tradeInfoOut)
});

$('#clearOutTrade').on('click', function() {
  tradeInfoOut = {};
  console.log(tradeInfoOut);
})

$('#tradeWindowIn').droppable( {
  drop: function(event, ui){
    console.log(event)
    console.log(ui)
    console.log(tradeInfoOut);
    var draggable = ui.draggable;
    var id = draggable.attr('gameid');
    console.log(id + ' gameid');
    // $('#gameListOut').html(tradeInfoOut.gameId)
  },
  activeClass: 'highlight',
  hoverClass: 'foundhome'
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
        stack: '.cards',
        activeClass: 'highlight'
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
