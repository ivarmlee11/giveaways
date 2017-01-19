$(function() {

var socket = io.connect();

function TradeWindow(sendTo, tradeGame, tradeUser, sentFromId, sentFromName, clearThis) {
  this.sendTo = sendTo,
  this.gameId = tradeGame,
  this.userId = tradeUser,
  this.sentFromId = sentFromId,
  this.sentFromName = sentFromName,
  this.clearThis = clearThis
};

var tradingArea = $('#tradingArea'),
    tradeWindowOut = $('#tradeWindowOut'),
    messageBox = $('#messageBox'),
    playerIn = $('#playerIn'),
    playerOut = $('#playerOut'),
    gameListIn = $('#gameListIn'),
    gameListOut = $('#gameListOut'),
    tradeWindowIn = $('#tradeWindowIn'),
    tradeInfoOut = new TradeWindow(null, [], null, null, null, false),
    tradeInfoIn = new TradeWindow(null, [], null, null, null, false),
    otherTraderAcceptedOffer = false,
    tradeInProgress = false,
    sentFromId = $('#sentFromId').text(),
    sentFromName = $('#sentFromName').text();

tradeInfoOut.sentFromId = parseInt(sentFromId);
tradeInfoOut.sentFromName = sentFromName;

socket.on('updateList', function(connectedPlayers){
  console.log('connected players');
  console.log(connectedPlayers);
});

socket.on('get trade', function(trade) {
  console.log('getting trade');
  console.log(tradeInProgress + ' trade in progress')
  console.log(trade.clearThis + ' if true this trade will be cleared')

  if (!tradeInProgress && !trade.clearThis) {
    console.log('fresh trade proposal')
    tradeInProgress = true;   
    tradeInfoIn = trade;
    playerIn.html(trade.sentFromName);
    gameListIn.html(trade.gameId.length + ' items');
    messageBox.html('Incoming trade!');
  } else if (tradeInProgress && !trade.clearThis && (trade.sentFromId === tradeInfoIn.sentFromId)) {
    var message = {
      message: 'The trader has a trade in progress.',
      sentToId: trade.sentFromId
    }
    socket.emit('Trade in progress', message)
  } else if (trade.clearThis && (trade.sentFromId === tradeInfoIn.sentFromId)) {
    tradeInProgress = false;
    tradeInfoIn = trade;
    tradeInfoIn.clearThis = false;
    playerIn.html('');
    gameListIn.html('');
    messageBox.html('The other trader cleared their incoming trade to you');
  }
});

socket.on('trade busy', function(message) {
  console.log('trade in progress')
  console.log(message)
  messageBox.html(message);
});

$('#playerDropDown').on('click', function() {
  playerOut.html($(this).val());
  gameListOut.html(tradeInfoOut.gameId.length + ' items');
  
  var userId = $('option:selected', this).attr('userid');
  
  tradeInfoOut.sendTo = $(this).val();
  tradeInfoOut.userId = parseInt(userId);
  tradeInfoOut.sentFromId = parseInt(sentFromId);
  tradeInfoOut.sentFromName = sentFromName;
  tradeInfoOut  .clearThis = false;
  if (tradeInfoOut.userId !== tradeInfoOut.sentFromId) {
    socket.emit('clientSenderA', tradeInfoOut);
  } else {
    messageBox.html('You cannot trade with yourself')
  }
  
  if(!tradeInfoOut.gameId.length) {
    messageBox.html('No games sent yet');
  } else {
    messageBox.html('Proposal sent')
  }

});

$('#clearOutTrade').on('click', function() {
  tradeInfoOut.gameId = [];
  // tradeInfoOut.sentFromId = null;
  tradeInfoOut.clearThis = true;
  tradeInfoOut.sentFromName = null;


  if (tradeInfoOut.userId) {
    console.log('trade info out')
    console.log(tradeInfoOut)
    tradeInfoOut.clearThis = true;
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
  tradeInProgress = false;
  tradeInfoIn.sendTo = null;
  // tradeInfoIn.sentFromId = null;
  tradeInfoIn.sentFromName = null;
  tradeInfoIn.gameId = [];

  console.log('clearing trade')
  if (tradeInfoIn.userId) {
    tradeInfoIn.clearThis = true;
    var temp = tradeInfoIn.sentFromId;
    tradeInfoIn.sentFromId = tradeInfoIn.userId;
    tradeInfoIn.userId = temp;
    console.log(tradeInfoIn)
    socket.emit('clientSenderA', tradeInfoIn);
  }

  gameListIn.html('');
  playerIn.html('');
  tradeWindowIn.html('');
  messageBox.html('Incoming trade cleared');
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
        id = draggable.attr('gameid');

    tradeInProgrsess = true;
    tradeInfoOut.clearThis = false;

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
