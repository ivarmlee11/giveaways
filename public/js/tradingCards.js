$(function() {

var socket = io.connect();

function TradeWindow(sendTo, tradeGame, tradeUser, sentFromId, sentFromName) {
  this.sendTo = sendTo,
  this.gameId = tradeGame,
  this.userId = tradeUser,
  this.sentFromId = sentFromId,
  this.sentFromName = sentFromName
};

var tradingArea = $('#tradingArea'),
    tradeWindowOut = $('#tradeWindowOut'),
    messageBox = $('#messageBox'),
    playerIn = $('#playerIn'),
    playerOut = $('#playerOut'),
    gameListIn = $('#gameListIn'),
    gameListOut = $('#gameListOut'),
    tradeWindowIn = $('#tradeWindowIn'),
    tradeInfoOut = new TradeWindow(null, [], null, null, null),
    tradeInfoIn = new TradeWindow(null, [], null, null, null),
    otherTraderAcceptedOffer = false,
    tradeInProgrsess = false,
    sentFromId = $('#sentFromId').text(),
    sentFromName = $('#sentFromName').text();

tradeInfoOut.sentFromId = parseInt(sentFromId);
tradeInfoOut.sentFromName = sentFromName;

socket.on('updateList', function(connectedPlayers){
  console.log('connected players');
  console.log(connectedPlayers);
});

var lastId = null;

socket.on('get trade', function(trade) {
  console.log('getting trade');
  console.log(trade);
  if ((!lastId) || (lastId = trade.sentFromId)) {
    lastId = trade.sentFromId;
    console.log(lastId)
    playerIn.html(trade.sentFromName);
    gameListIn.html(trade.gameId.length + ' items'); 
  }
  
});

$('#playerDropDown').on('click', function() {
  playerOut.html($(this).val());
  gameListOut.html(tradeInfoOut.gameId.length + ' items');
  
  var userId = $('option:selected', this).attr('userid');
  
  tradeInfoOut.sendTo = $(this).val();
  tradeInfoOut.userId = parseInt(userId);
  tradeInfoOut.sentFromId = parseInt(sentFromId);
  tradeInfoOut.sentFromName = sentFromName;
  
  socket.emit('clientSenderA', tradeInfoOut);
  
  if(!tradeInfoOut.gameId.length) {
    messageBox.html('No games sent yet.');
  } else {
    messageBox.html('Proposal sent.')
  }

});

$('#clearOutTrade').on('click', function() {
  var sendIt = tradeInfoOut.userId;

  tradeInfoOut.gameId = [];
  // tradeInfoOut.sentFromId = null;
  tradeInfoOut.sentFromName = null;

  if (tradeInfoOut.userId) {
    console.log('trade info out')
    console.log(tradeInfoOut)
    socket.emit('clientSenderA', tradeInfoOut);
    tradeInfoOut.userId = null;
    tradeInfoOut.sendTo = null;
  }

  gameListOut.html('');
  playerOut.html('');

  tradingArea.html('');
  tradeWindowOut.html('');
  messageBox.html('Outgoing trade cleared');
  updateTradeableCards();
});

$('#clearIncTrade').on('click', function() {
  tradeInProgrsess = false;
  console.log(tradeInfoIn)
  if (tradeInfoIn.userId) {
    socket.emit('clientSenderA', tradeInfoIn);
  }

  gameListIn.html('');
  playerIn.html('');


  messageBox.html('Incoming trade cleared');
  tradeWindowIn.html('');
});


$('#acceptTrade').on('click', function() {
  if(tradeInfoIn.sendTo && tradeInfoIn.userId && tradeInfoOut.sendTo && tradeInfoOut.userId) {
    tradeInProgrsess = false;
    if(otherTraderAcceptedOffer) {
      console.log('other player accepted offer');

      //ajax call to switch ownership of games
      
    } else {
      console.log('other payer needs to accept offfer')
    }

  } else {
    messageBox.html('Trades require that both parties propose a trade, even if they offer nothing');
  };

});

tradeWindowOut.droppable({
  drop: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        tradeInProgrsess = true;

    tradeInfoOut.gameId.push(parseInt(id));

    tradeInfoOut.gameId = tradeInfoOut.gameId.filter(function(item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });

    gameListOut.html(tradeInfoOut.gameId.length + ' items');

    if(tradeInfoOut.sendTo && tradeInfoOut.userId) {

      socket.emit('clientSenderA', tradeInfoOut);

      messageBox.html('Proposal sent.');
    } else {

      messageBox.html('To propose a trade you need a recipient');
    } 
  },
  activeClass: 'highlight',
  hoverClass: 'foundhome'
});

function findGameInfo(array) {
  var url = '/game/gameData/'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      console.log(cardList)
      return cardList;
    }
  });
};

function displayIncomingGames(array) {
  tradeWindowIn.html('');
  array.forEach(function(val) {
    console.log(val);
    tradeWindowIn.append(
      '<div gameId="' + val.id + '" class="cardsStatic">' + 
      '<h3>' + val.name + '</h3>' + 
      '</div>'
    )
  });
};

function updateTradeableCards() {
  var url = '/game/winnerCard/'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      cardList.forEach(function(val) {
        tradingArea.append('<div gameId="' + val.id + '" class="cards">' + 
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
          users = [];

      playerList.forEach(function(val) {
        users.push({
          username: val.username,
          id: val.id
        });
      });

      $('#playerTradeList').html('');
      users.forEach(function(val) {
        $('#playerTradeList').append('<option userid="' + val.id + '">' + val.username + '</option>');  
      });
    }
  });
};

updateTradeableCards();
updatePlayerList();
});
