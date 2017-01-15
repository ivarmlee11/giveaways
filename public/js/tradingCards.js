$(function() {

function TradeWindow(tradeName, tradeGame, tradeUser) {
  this.name = tradeName,
  this.gameId = tradeGame,
  this.userId = tradeUser
};

var $tradingArea = $('#tradingArea'),
    tradeInfoOut = new TradeWindow(null, [], null),
    tradeInfoIn = new TradeWindow(null, [], null),
    otherTraderAcceptedOffer = false;

$('#playerDropDown').on('click', function() {
  $('#playerOut').html($(this).val());
  var userId = $('option:selected', this).attr('userid');
  tradeInfoOut.name = $(this).val();
  tradeInfoOut.userId = parseInt(userId);
  console.log(tradeInfoOut)
});

$('#clearOutTrade').on('click', function() {
  tradeInfoOut = {
    name: null,
    gameId: [],
    userId: null
  };
  $('#playerOut').html('');
  $('#gameListOut').html('');
  console.log('trade info out');
  console.log(tradeInfoOut);
});

// $('#clearIncTrade').on('click', function() {
//   tradeInfoIn = {
//     name: null,
//     gameId: [],
//     userId: null
//   };
//   $('#playerIn').html('');
//   $('#gameListIn').html('');
//   console.log('trade info in');
//   console.log(tradeInfoIn);
// });

$('#proposeTrade').on('click', function() {
  if(tradeInfoOut.name && tradeInfoOut.userId) {
    console.log(tradeInfoOut);

    // call function to send object

    $('#messageBox').html('Proposal sent.');
  } else {
    console.log(tradeInfoOut);
    $('#messageBox').html('To propose a trade you need a recipient');
  }
});

$('#acceptTrade').on('click', function() {
  if(tradeInfoIn.name && tradeInfoIn.userId && tradeInfoOut.name && tradeInfoOut.userId) {
    
    // socket io message to other trader saying you like the conditions of the trade
    if(otherTraderAcceptedOffer) {
      console.log('other player accepted offer')
    } else {
      console.log('otgehr payer needs to accept offfer')
    }

  } else {
    $('#messageBox').html('Trades require that both parties propose a trade, even if they offer nother');
  };
  console.log(tradeInfoOut);
  console.log(tradeInfoIn);
});

$('#tradeWindowOut').droppable( {
  drop: function(event, ui){
    var draggable = ui.draggable,
      id = draggable.attr('gameid');
      console.log(tradeInfoOut)
    tradeInfoOut.gameId.push(parseInt(id));

    tradeInfoOut.gameId =  tradeInfoOut.gameId.filter( function( item, index, inputArray ) {
      return inputArray.indexOf(item) == index;
    });

    $('#gameListOut').html(tradeInfoOut.gameId.length + ' items');
    console.log(tradeInfoOut);
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

function incomingTrade() {

};

updateCards();
updatePlayerList();
});
