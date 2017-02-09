$(function() {

var socket = io.connect()

function TradeWindow(sendTo, tradeGame, tradeUser, sentFromId, sentFromName, clearThis) {
  this.sendTo = sendTo,
  this.gameId = tradeGame,
  this.userId = tradeUser,
  this.sentFromId = sentFromId,
  this.sentFromName = sentFromName,
  this.clearThis = clearThis
}

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
    playerTradeList = $('#playerTradeList'),
    ownedGames = $('#ownedGames'),
    acceptTrade = $('#acceptTrade'),
    acceptedByTrader = $('#acceptedByTrader'),
    tradeIplanfoOut = new TradeWindow(null, [], null, null, null, null),
    tradeInfoIn = new TradeWindow(null, [], null, null, null, null),
    offerAccepted = {},
    tradeInProgress = false,
    tradeInProgressIndicator = $('#tradeInProgress'),
    sentFromId = $('#sentFromId').text(),
    sentFromId = parseInt(sentFromId),
    sentFromName = $('#sentFromName').text()
  

socket.on('update players', function(connectedPlayers){
  currentPlayers.html('')
  playerTradeList.html('')
  var playerList = connectedPlayers,
      playerNames = playerList.map(function(player) {
        var rObj = {
          label: player.name,
          value: player.id
        }
        return rObj
      })
  console.log(playerNames)  
playerDropDown.autocomplete({
  source: playerList
})


  playerList.forEach(function(val) {
    playerTradeList.append('<option userid="' + val.id + '">' + val.clientName + '</option>')
  })
})



socket.on('get trade', function(trade) {
  acceptTrade.hide()
  // console.log(trade)

  if (!tradeInProgress && !trade.clearThis) {
    // console.log('trade made')
    tradeInProgress = true 
    tradeInfoIn = trade
    tradeWindowIn.html('')
    displayIncomingGames(tradeInfoIn.gameId)
    playerIn.html(tradeInfoIn.sentFromName)
    gameListIn.html(tradeInfoIn.gameId.length + ' items')
    messageBox.html('Incoming trade arrived from ' + tradeInfoIn.sentFromName)
    tradeInProgressIndicator.html('Trade in progress')
  } else if (tradeInProgress && (trade.sentFromId !== tradeInfoOut.userId)) {
    console.log('trade busy')
    acceptTrade.show();
    var message = { 
      message: 'That trader has a trade in progress',
      sentToId: trade.sentFromId
    }
    socket.emit('trade in progress', message)
  } else if (tradeInProgress &&  !trade.clearThis && (trade.sentFromId === tradeInfoIn.sentFromId)) {
    console.log('trade updated')
    acceptTrade.show()
    tradeInfoIn = trade
    tradeWindowIn.html('')
    displayIncomingGames(tradeInfoIn.gameId)
    playerIn.html(tradeInfoIn.sentFromName)
    gameListIn.html(tradeInfoIn.gameId.length + ' items')
    messageBox.html(tradeInfoIn.sentFromName + ' has updated the trade proposal')
    tradeInProgressIndicator.html('Trade in progress') 
  } else if (trade.clearThis && (trade.sentFromId === tradeInfoIn.sentFromId)) {
    // tradeInfoIn = trade
    console.log('trade cleared')
    playerDropDown.show()
    
    gameListOut.html('')
    playerOut.html('')
    tradingArea.html('')
    
    gameListIn.html('')
    playerIn.html('')
    tradeWindowIn.html('')

    updateTradeableCards()

    tradeInfoIn.userId = null
    tradeInfoOut.userId = null
    tradeInfoIn.clearThis = null
    tradeInfoOut.clearThis = null
    tradeInfoIn.sentFromId = null
    tradeInfoOut.sentFromId = null
    tradeInfoIn.gameId = []
    tradeInfoOut.gameId = []
    tradeInProgress = false

    tradeInProgressIndicator.html('Trade not in progress')
    messageBox.html('The other trade reset the trade')
  }
  console.log('trade info out')
  console.log(tradeInfoOut)
    console.log('trade info in')

  console.log(tradeInfoIn)
})



socket.on('accept offer confirmed', function(acceptObj) {
  var offerAccepted = acceptObj,
  dataObj = {
    traderA: tradeInfoIn.sentFromId,
    traderB: tradeInfoIn.userId,
    gamesA: tradeInfoIn.gameId,
    gamesB: tradeInfoOut.gameId
  },
  url = '/game/trade/'

  console.log(dataObj)

  $.ajax({
    url: url,
    type: 'POST',
    data: dataObj,
    success: function() {
      console.log('test')
      location.reload()
    }
  })
  messageBox.html('Other play accepted offer')
})

socket.on('trade busy', function(message) {
  tradeInfoOut.userId = null
  tradeInfoOut.gameId = []
  tradeInProgress = false
  playerDropDown.show()
  gameListOut.html('')
  playerOut.html('')
  gameListIn.html('')
  playerIn.html('')
  tradingArea.html('')
  tradeWindowOut.html('')
  tradeWindowIn.html('')
  updateTradeableCards()
  updateOwnedCards()
  messageBox.html(message)
  tradeInProgressIndicator.html('Trade not in progress')
})

playerDropDown.on('click', function() {
  var userId = $('option:selected', this).attr('userid')
  
  playerOut.html($(this).val())
  gameListOut.html(tradeInfoOut.gameId.length + ' items')
  
  tradeInfoOut.sendTo = $(this).val()
  tradeInfoOut.userId = parseInt(userId)
  tradeInfoOut.sentFromId = sentFromId
  tradeInfoOut.sentFromName = sentFromName
  tradeInfoOut.clearThis = null

  tradeInProgress = true
  tradeInProgressIndicator.html('Trade in progress')
  
  if (tradeInfoIn.sentFromId === tradeInfoOut.userId) {
    acceptTrade.show()
  }

  if (!tradeInfoOut.gameId.length) {
    messageBox.html('No games sent')
  } else {
    messageBox.html('Proposal sent with games')
  }

  if (tradeInfoOut.userId !== sentFromId) {
    socket.emit('trade', tradeInfoOut)
  } else {
    tradeInProgress = false
    messageBox.html('You cannot trade with yourself')
    tradeInProgressIndicator.html('Trade not in progress')
  }
  $(this).hide()

})

clearOutTrade.on('click', function() {
  acceptTrade.hide()
  playerDropDown.show()
  tradeInfoOut.gameId = []
  tradeInfoOut.sentFromId = sentFromId
  tradeInfoOut.userId = tradeInfoIn.sentFromId
  tradeInfoOut.clearThis = 'out'


  if (tradeInfoOut.userId) {
    socket.emit('trade', tradeInfoOut)
    tradeInProgress = false
    messageBox.html('Outgoing trade cleared')
    tradeInProgressIndicator.html('Trade not in progress')
  } else {
    tradeInProgressIndicator.html('No trade to clear')
  }

  tradeInfoOut.sentFromName = null
  tradeInfoOut.userId = null

  gameListOut.html('')
  playerOut.html('')
  gameListIn.html('')
  playerIn.html('')
  tradingArea.html('')
  tradeWindowOut.html('')
  tradeWindowIn.html('')

  updateTradeableCards()
})

acceptTrade.on('click', function() {
  var acceptObject = {
    accept: true,
    sentFromId: tradeInfoOut.sentFromId,
    sendTo: tradeInfoOut.userId
  }
  if (tradeInfoOut.userId === tradeInfoIn.sentFromId) {
    messageBox.html('Offer made!')
    socket.emit('accept offer', acceptObject)
  }
})

tradeWindowOut.droppable({
  drop: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)

    tradeInfoOut.clearThis = null

    tradeInfoOut.gameId = tradeInfoOut.gameId.filter(function(item, index, inputArray) {
      return item !== id
    })

    tradeInfoOut.gameId.push(parseInt(id))

    gameListOut.html(tradeInfoOut.gameId.length + ' items')

    if (tradeInfoOut.sendTo && tradeInfoOut.userId) {
      socket.emit('trade', tradeInfoOut)
      messageBox.html('Proposal sent')
    } else {
      messageBox.html('To propose a trade you need a recipient')
    } 
  },
  out: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)

    tradeInfoOut.gameId = tradeInfoOut.gameId.filter(function(item, index, inputArray) {
      return item !== id
    })

    socket.emit('trade', tradeInfoOut)
    
    gameListOut.html(tradeInfoOut.gameId.length + ' items')

    if(tradeInfoOut.gameId.length) {
      messageBox.html('Game removed')
    } else {
      messageBox.html('Put your game in the trading area')
    }
  },
  activeClass: 'highlight',
  hoverClass: 'foundhome'
})

function displayIncomingGames(gameIdArray) {
  var gameIdArray = gameIdArray

  tradeWindowIn.html('')

  gameIdArray.forEach(function(val) {
    var url = '/game/gameData/' + val

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
    })
  })  
}

function updateTradeableCards() {
  var url = '/game/winnerCard/'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      cardList.forEach(function(val) {
        if(!val.coderevealed) {
          tradingArea.append('<div gameId="' + val.id + '" class="cards">' + 
          '<h3>' + val.name + '</h3>' + 
          '<h5><a href="/game/claimed/' + val.id + '">Reveal Code</a></h5>' +
          '</div>'
        )
        }
      })
      $('.cards').draggable({
        stack: '.cards',
        activeClass: 'highlight'
      })
    }
  })
}

function updateOwnedCards() {
  var url = '/game/winnerCard/'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      cardList.forEach(function(val) {
        if(val.coderevealed) {
          ownedGames.append('<div class="cardsStatic">' + 
            '<h3>' + val.name + '</h3>' + 
            '<h5>' + val.code + '</h5>' +
            '</div>'
          )
        }
      })
    }
  })
}

updateTradeableCards()
updateOwnedCards()
})
