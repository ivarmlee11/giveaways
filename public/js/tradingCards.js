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
  // console.log(connectedPlayers);
});

socket.on('get trade', function(trade) {



    console.log('-------------')
 
  console.log('-------------')
   console.log('-------------')
  console.log('-------------')
   console.log('-------------') 
  console.log('incoming trade')



  console.log(JSON.stringify(trade));
   console.log('-------------')
  console.log('-------------')

  console.log('trade info in object')
  console.log('-------------')
   console.log('-------------')
  console.log(JSON.stringify(tradeInfoIn))
  console.log('-------------')
  console.log('-------------')
    console.log('trade info out object')
  console.log('-------------')
   console.log('-------------')
  console.log(JSON.stringify(tradeInfoOut))
   console.log('-------------')
  
    console.log('-------------')
   console.log(tradeInProgress)
  console.log('-------------')
  console.log(trade.userId === tradeInfoOut.sentFromId)
  console.log(!trade.clearThis)
  console.log(trade.sentFromId === (tradeInfoIn.sentFromId || tradeInfoOut.userId))
  console.log(trade.sentFromId, tradeInfoIn.sentFromId, tradeInfoOut.userId)
   console.log('-------------')
  if (!tradeInProgress && !trade.clearThis) {
    console.log('trade made')
    tradeInProgress = true; 
    tradeInfoIn = trade;
    tradeWindowIn.html('');
    displayIncomingGames(tradeInfoIn.gameId);
    playerIn.html(tradeInfoIn.sentFromName);
    gameListIn.html(tradeInfoIn.gameId.length + ' items');
    tradeInProgressIndicator.html('Trade in progress');
    messageBox.html('Incoming trade arrived from ' + tradeInfoIn.sentFromName);
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
    tradeInProgressIndicator.html('Trade in progress'); 
    messageBox.html(tradeInfoIn.sentFromName + ' has updated the trade proposal');
  } else if (trade.clearThis && (trade.sentFromId === (tradeInfoIn.sentFromId || tradeInfoOut.userId))) {
    console.log('trade cleared')
    tradeInfoIn = trade;
    if (trade.clearThis === 'in') {
      console.log('trade cleared in')
      gameListOut.html('');
      playerOut.html('');
      tradeInfoOut.userId = null;
      // tradeInfoOut.clearThis = null;
      tradingArea.html('');
      messageBox.html('The other trader cleared your trade offer');
      updateTradeableCards();
    } else {
     console.log('trade cleared out')
      tradeInfoIn.clearThis = null;
      tradeInfoIn.sentFromId = null;



      gameListIn.html('');
      playerIn.html('');
      tradeWindowIn.html('');
      messageBox.html('The other trade removed their offer');      
    }
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

$('#playerDropDown').on('click', function() {

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
  console.log('trade Info Out')
  console.log(JSON.stringify(tradeInfoOut))

  if (tradeInfoOut.userId !== sentFromId) {
    socket.emit('clientSenderA', tradeInfoOut);
  } else {
    tradeInProgress = false;
    messageBox.html('You cannot trade with yourself');
    tradeInProgressIndicator.html('Trade not in progress');
  }
  $(this).hide();
});

$('#clearOutTrade').on('click', function() {
  $('#playerDropDown').show()
  tradeInfoOut.gameId = [];
  tradeInfoOut.clearThis = 'out';

  gameListOut.html('');
  playerOut.html('');
  tradingArea.html('');
  tradeWindowOut.html('');

  if (tradeInfoOut.userId) {
    socket.emit('clientSenderA', tradeInfoOut);
    console.log('sent to user')
    tradeInProgress = false;
    tradeInProgressIndicator.html('Trade not in progress');
    messageBox.html('Outgoing trade cleared');
  } else {
    console.log('no user Id');
  }

  tradeInfoOut.sentFromName = null;
  tradeInfoOut.userId = null;
  updateTradeableCards();
});

$('#clearIncTrade').on('click', function() {
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
  // tradeInfoIn.sentFromId = temp;
  gameListIn.html('');
  playerIn.html('');
  tradeWindowIn.html('');
  messageBox.html('Incoming trade cleared');
  tradeInProgressIndicator.html('Trade not in progress');
});


$('#acceptTrade').on('click', function() {
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

    tradeInfoOut.gameId = tradeInfoOut.gameId.filter(function(item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });

    gameListOut.html(tradeInfoOut.gameId.length + ' items');

    if (tradeInfoOut.sendTo && tradeInfoOut.userId) {

      socket.emit('clientSenderA', tradeInfoOut);

      messageBox.html('Proposal sent.');
    } else {

      messageBox.html('To propose a trade you need a recipient');
    } 
  },
  activeClass: 'highlight',
  hoverClass: 'foundhome'
});

function findGameInfo() {
  var url = '/game/gameData/'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      console.log(cardList);
      return cardList;
    }
  });
};

function displayIncomingGames(array) {
  array.forEach(function(val) {
    console.log(val);
    tradeWindowIn.append(
      '<div class="cardsStatic">' + 
      '<h3>' + val + '</h3>' + 
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
