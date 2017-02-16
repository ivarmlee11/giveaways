$(function() {

var socket = io.connect()

var tradingArea = $('#tradingArea'),
    tradeWindowOut = $('#tradeWindowOut'),
    tradeWindowIn = $('#tradeWindowIn'),
    messageBox = $('#messageBox'),
    playerIn = $('#playerIn'),
    playerOut = $('#playerOut'),
    // gameListIn = $('#gameListIn'),
    // gameListOut = $('#gameListOut'),
    currentPlayers =  $('#currentPlayers'),
    playerDropDown = $('#playerDropDown'),
    clearOutTrade = $('#clearOutTrade'),
    ownedGames = $('#ownedGames'),
    acceptTrade = $('#acceptTrade'),
    suggestion = $('#suggestion'),
    revealLink = $('#reveal'),
    sentFromId = $('#sentFromId').text(),
    sentFromIdInt = parseInt(sentFromId),
    acceptedByTrader = $('#acceptedByTrader'),
    tradeInProgressIndicator = $('#tradeInProgress'),
    tradeObj = {},
    playerNames = [],
    playerList = []

function clearTradeObject() {
  tradeObj['sentFromId'] = sentFromIdInt
  tradeObj['sentFromName'] = $('#sentFromName').text()
  tradeObj['games'] = []
  tradeObj['gamesIn'] = []
  tradeObj['agreeOnTerms'] = false
  tradeObj['tradeInProgress'] = false
  tradeObj['clearTrade'] = false
  tradeObj['lastTrader'] = null
}

clearTradeObject()

function clearTrade() {
  acceptedByTrader.html('')
  otherTraderAccepted = false
  tradeWindowIn.html('')
  tradeWindowOut.html('')
  playerIn.html('')
  playerDropDown.show()
  suggestion.html('')
  messageBox.html('')
}

function makeTrade(tradeInfo) {
  $.ajax({
    type: 'POST',
    url: '/game/trade/',
    data: tradeInfo,
    success: function(data) {
      acceptedByTrader.html('<h1>Trade finalized</h1>')
      setTimeout(function(){ 
        clearTrade()
       }, 10000)
    }
  })  
}

function sendTrade(tradeObj) {
  socket.emit('send trade', tradeObj)
}

socket.on('update players', function(connectedPlayers){
  
  playerList = connectedPlayers

  playerNames = playerList.map(function(player) {
    var playerAuth = player.clientName + ' ' + player.auth,
    rObj = {
      value: playerAuth,
      data: player.id
    }  

    return rObj
    
  })

  playerDropDown.autocomplete({
    lookup: playerNames,
    onSelect: function (player) {
      tradeObj.tradeInProgress = player.data
      tradeObj.lastTrader = sentFromIdInt
      suggestion.html('Trading with ' + player.value)
      messageBox.html('Trade started')
      socket.emit('send trade', tradeObj)
      playerDropDown.hide()
    }
  })

  currentPlayers.html('')

  playerList.forEach(function(player) {
  })
})

socket.on('get trade', function(trade) {
  var trade = trade

  if(!tradeObj.tradeInProgress) {

    
    tradeObj.tradeInProgress = trade.sentFromId
    tradeObj.gamesIn = trade.games
    tradeObj.lastTrader = trade.sentFromId
    
    playerIn.html(trade.sentFromName)
    suggestion.html('Trading with ' + trade.sentFromName)
    playerDropDown.hide()
    messageBox.html('Trade started')
    
    displayIncomingGames(tradeObj.gamesIn)

  } else if ((trade.sentFromId === tradeObj.tradeInProgress) && !trade.clearTrade) {


    tradeWindowIn.html('')

    tradeObj.gamesIn = trade.games
    tradeObj.lastTrader = trade.sentFromId
    tradeObj.agreeOnTerms = false

    playerIn.html(trade.sentFromName)
    messageBox.html('Trade updated')
    
    displayIncomingGames(tradeObj.gamesIn)

  } else if ((trade.sentFromId === tradeObj.tradeInProgress) && trade.clearTrade) {

    
    tradeObj.agreeOnTerms = false
    clearTradeObject()
    
    updateTradeableCards()
    clearTrade()
    messageBox.html('Trade cleared')

  } else if (trade.sentFromId !== tradeObj.tradeInProgress) {

    socket.emit('busy', trade)

  }
})

socket.on('busy', function(msg) {
  tradeWindowIn.html(msg)
  messageBox.html(msg)
  clearTradeObject()
})

socket.on('dc', function(msg) {
  clearTrade()
  clearTradeObject()
  updateTradeableCards()
})

var otherTraderAccepted = false
socket.on('other trader accepted trade conditions', function(tradeObj) {
  acceptedByTrader.html('Other guy likes the trade conditions')
  // if(otherTraderAccepted) {
  //         acceptedByTrader.html('<h1>Trade finalized</h1>')
  //     setTimeout(function(){ 
  //       clearTrade()
  //      }, 10000)
  // }
  otherTraderAccepted = true
})

acceptTrade.on('click', function() {
  if(otherTraderAccepted) {
    var tradeInfo = {
      gamesA: tradeObj.games,
      gamesB: tradeObj.gamesIn,
      traderA: tradeObj.sentFromId,
      traderB: tradeObj.tradeInProgress
    }
    makeTrade(tradeInfo)
    if(otherTraderAccepted) {
      acceptedByTrader.html('<h1>Trade finalized</h1>')
      setTimeout(function(){ 
        clearTrade()
       }, 10000)
    }
  }
  if(tradeObj.tradeInProgress) {
    socket.emit('accept trade', tradeObj)
  } else {
    messageBox.html('You must be trading with somebody to accept the trade')
  }
})

clearOutTrade.on('click', function() {
  tradeObj['games'] = []
  tradeObj['gamesIn'] = []
  tradeObj['agreeOnTerms'] = false
  tradeObj['clearTrade'] = true 
  socket.emit('send trade', tradeObj)
  tradeObj['clearTrade'] = false   
  tradeObj['tradeInProgress'] = false

  clearTrade()
  updateTradeableCards()
})


tradeWindowOut.droppable({
  drop: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id),
        reveal = draggable.find('a')

    tradeObj.games.push(id)
    reveal.hide()

    tradeObj.games = tradeObj.games.filter(function( item, index, inputArray ) {
      return inputArray.indexOf(item) == index
    })
    sendTrade(tradeObj)
  },
  out: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id),
        reveal = draggable.find('a')

    reveal.show()

    tradeObj.games = tradeObj.games.filter(function(gameId) {
      return gameId !== id
    })
    sendTrade(tradeObj)
  },
  activeClass: 'highlight',
  hoverClass: 'foundhome'
})

function displayIncomingGames(gameIdArray) {

  var gameIdArray = gameIdArray

  tradeWindowIn.html('')

  if(gameIdArray) {
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
  } else {
    tradeWindowIn.html('<div class="text-center">No games were sent</div>')
  } 
}

function updateTradeableCards() {

  tradingArea.html('')

  var url = '/game/winnerCard/'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      cardList.forEach(function(val) {
        if(!val.coderevealed) {
          tradingArea.append(
            '<div gameId="' + val.id + '" class="cards">' + 
            '<h3>' + val.name + '</h3>' + 
            '<h5><a id="reveal" href="/game/claimed/' + val.id + '">Reveal Code</a></h5>' +
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

  ownedGames.html('')

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
