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
    tradeWindowIn = $('#tradeWindowIn'),
    messageBox = $('#messageBox'),
    playerIn = $('#playerIn'),
    playerOut = $('#playerOut'),
    gameListIn = $('#gameListIn'),
    gameListOut = $('#gameListOut'),
    currentPlayers =  $('#currentPlayers'),
    playerDropDown = $('#playerDropDown'),
    clearOutTrade = $('#clearOutTrade'),
    clearIncTrade = $('#clearIncTrade'),
    playerTradeList = $('#playerTradeList'),
    acceptTrade = $('#acceptTrade'),
    tradeInfoOut = new TradeWindow(null, [], null, null, null, null),
    tradeInfoIn = new TradeWindow(null, [], null, null, null, null),
    otherTraderAcceptedOffer = false,
    tradeInProgress = false,
    tradeInProgressIndicator = $('#tradeInProgress'),
    sentFromId = $('#sentFromId').text()
    sentFromId = parseInt(sentFromId),
    sentFromName = $('#sentFromName').text();

tradeInfoOut.sentFromId = sentFromId;
tradeInfoOut.sentFromName = sentFromName;
tradeInProgressIndicator.html('Trade not in progress');

socket.on('updateList', function(connectedPlayers){
  currentPlayers.html('');
  playerTradeList.html('');
  var playerList = connectedPlayers;
  playerList.forEach(function(val) {
    currentPlayers.append('<h5 clientId="' + val.id + '">' + val.clientName + '</h5>');
    playerTradeList.append('<option userid="' + val.id + '">' + val.clientName + '</option>');
  });
});

socket.on('get trade', function(trade) {
  if (!tradeInProgress && !trade.clearThis) {
    console.log('trade made')
    tradeInProgress = true; 
    tradeInfoIn = trade;
    tradeWindowIn.html('');
    displayIncomingGames(tradeInfoIn.gameId);
    playerIn.html(tradeInfoIn.sentFromName);
    gameListIn.html(tradeInfoIn.gameId.length + ' items');
    messageBox.html('Incoming trade arrived from ' + tradeInfoIn.sentFromName);
    tradeInProgressIndicator.html('Trade in progress');
  } else if (tradeInProgress && !trade.clearThis &&  (trade.userId !== tradeInfoOut.sentFromId)) {
    console.log('trade busy')
    var message = { 
      message: 'That trader has a trade in progress',
      sentToId: trade.sentFromId
    };
    socket.emit('Trade in progress', message);
  } else if (tradeInProgress &&  !trade.clearThis && (trade.userId === tradeInfoOut.sentFromId)) {
    console.log('trade updated')
    tradeInfoIn = trade;
    tradeWindowIn.html('');
    displayIncomingGames(tradeInfoIn.gameId);
    playerIn.html(tradeInfoIn.sentFromName);
    gameListIn.html(tradeInfoIn.gameId.length + ' items');
    messageBox.html(tradeInfoIn.sentFromName + ' has updated the trade proposal');
    tradeInProgressIndicator.html('Trade in progress'); 
  } else if (trade.clearThis && (trade.sentFromId === (tradeInfoOut.userId || null))) {
    tradeInfoIn = trade;
    if (trade.clearThis === 'in') {
      console.log('trade cleared in')
      tradeInfoOut.userId = null;
      gameListOut.html('');
      playerOut.html('');
      tradingArea.html('');
      messageBox.html('The other trader cleared your trade offer');
      updateTradeableCards();
    } else {
     console.log('trade cleared out')
      gameListIn.html('');
      playerIn.html('');
      tradeWindowIn.html('');
      messageBox.html('The other trade removed their offer');      
    }
    tradeInfoIn.clearThis = null;
    tradeInProgress = false;
    tradeInProgressIndicator.html('Trade not in progress');
    }
});

socket.on('trade busy', function(message) {
  tradeInfoOut.userId = null;
  tradeInProgress = false;
  messageBox.html(message);
  tradeInProgressIndicator.html('Trade not in progress');
});

playerDropDown.on('click', function() {

  playerOut.html($(this).val());
  gameListOut.html(tradeInfoOut.gameId.length + ' items');
  
  var userId = $('option:selected', this).attr('userid');
  
  tradeInfoOut.sendTo = $(this).val();
  tradeInfoOut.userId = parseInt(userId);
  tradeInfoOut.sentFromId = sentFromId;
  tradeInfoOut.sentFromName = sentFromName;
  tradeInfoOut.clearThis = null;


  tradeInProgress = true;
  tradeInProgressIndicator.html('Trade in progress');
  
  if (!tradeInfoOut.gameId.length) {
    messageBox.html('No games sent');
  } else {
    messageBox.html('Proposal sent with games');
  }


  if (tradeInfoOut.userId !== sentFromId) {
    socket.emit('clientSenderA', tradeInfoOut);
  } else {
    tradeInProgress = false;
    messageBox.html('You cannot trade with yourself');
    tradeInProgressIndicator.html('Trade not in progress');
  }
  $(this).hide();
    console.log('trade Info Out')
  console.log(JSON.stringify(tradeInfoOut))

});

clearOutTrade.on('click', function() {
  playerDropDown.show()
  tradeInfoOut.gameId = [];
  tradeInfoOut.clearThis = 'out';

  gameListOut.html('');
  playerOut.html('');
  tradingArea.html('');
  tradeWindowOut.html('');

  if (tradeInfoOut.userId) {
    socket.emit('clientSenderA', tradeInfoOut);
    tradeInProgress = false;
    messageBox.html('Outgoing trade cleared');
    tradeInProgressIndicator.html('Trade not in progress');
  } else {
    tradeInProgressIndicator.html('No trade to clear');
  }

  tradeInfoOut.sentFromName = null;
  tradeInfoOut.userId = null;
    console.log(JSON.stringify(tradeInfoOut))

  updateTradeableCards();
    console.log('trade Info Out')
  console.log(JSON.stringify(tradeInfoOut))
});

clearIncTrade.on('click', function() {
  if(tradeInfoIn.sentFromId) {
    var temp = tradeInfoIn.sentFromId;
    tradeInfoIn.sentFromId = tradeInfoIn.userId;
    tradeInfoIn.userId = temp;
    tradeInfoIn.gameId = [];
    tradeInfoIn.clearThis = 'in';

    tradeInProgress = false;

    if (tradeInfoIn.userId) {
      socket.emit('clientSenderA', tradeInfoIn);
      console.log('sent to user')
    } else {
      console.log('no user Id')
    }
    tradeInfoIn.userId = null;

    gameListIn.html('');
    playerIn.html('');
    tradeWindowIn.html('');
    messageBox.html('Incoming trade cleared');
    tradeInProgressIndicator.html('Trade not in progress');
  } else {
    tradeInProgressIndicator.html('There were no incoming trades to clear');
  }
    console.log('trade Info in')
  console.log(JSON.stringify(tradeInfoIn))
});


acceptTrade.on('click', function() {
  if (tradeInfoIn.sendTo && tradeInfoIn.userId && tradeInfoOut.sendTo && tradeInfoOut.userId) {
    // tradeInProgress = false;
    if (otherTraderAcceptedOffer) {
      console.log('other player accepted offer');

      //ajax call to switch ownership of games
      
    } else {
      console.log('other payer needs to accept offfer');
    }

  } else {
    messageBox.html('Trades require that both parties propose a trade, even if they offer nothing');
  };

});

tradeWindowOut.droppable({
  drop: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid');

    // tradeInProgress = true;
    tradeInfoOut.clearThis = null;

    tradeInfoOut.gameId.push(parseInt(id));



    gameListOut.html(tradeInfoOut.gameId.length + ' items');

    if (tradeInfoOut.sendTo && tradeInfoOut.userId) {

      socket.emit('clientSenderA', tradeInfoOut);

      messageBox.html('Proposal sent');
    } else {

      messageBox.html('To propose a trade you need a recipient');
    } 
  },
  out: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id);

    tradeInfoOut.gameId = tradeInfoOut.gameId.filter(function(item, index, inputArray) {
      return item !== isRequired;
    });

    socket.emit('clientSenderA', tradeInfoOut);
    
    gameListOut.html(tradeInfoOut.gameId.length + ' items');
    messageBox.html('Game removed');
  },
  activeClass: 'highlight',
  hoverClass: 'foundhome'
});

function displayIncomingGames(gameIdArray) {
  var gameIdArray = gameIdArray;
  tradeWindowIn.html('');

  gameIdArray.forEach(function(val) {
    var url = '/game/gameData/' + val;

    $.ajax({
      url: url,
      type: 'GET',
      success: function(gameInfo) {
        tradeWindowIn.append(
          '<div class="cardsStatic">' + 
          '<h3>' + gameInfo.name + '</h3>' + 
          '</div>'
          )
      }
    });
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

updateTradeableCards();
});
