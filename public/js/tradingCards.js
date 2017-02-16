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
    playerList = [],
    customBox = $("#custom")
    colorSample = $('#colorSample')

function showMyColor(id) {
  var url = '/user/colorget/' + id
  $.ajax({
    type: 'GET',
    url: url,
    success: function(color) {
      colorSample.html('')
      colorSample.append('<div class="fixedHeight" style="background-color:' + color + '">')   
    }
  })
}

showMyColor(sentFromIdInt)

function changeMyColor(id, color) {
  var url = '/user/changecolor/' + id,
      color = {
        color: color
      }
  $.ajax({
    type: 'POST',
    data: color,
    url: url,
    success: function() {
      location.reload() 
    }
  })
}

customBox.spectrum({
  color: "#f00",
  preferredFormat: "hex"
})

customBox.on('change', function() {
  var color = customBox.val()
  changeMyColor(sentFromIdInt, color)
})

function clearTradeObject() {
  tradeObj['sentFromId'] = sentFromIdInt
  tradeObj['sentFromName'] = $('#sentFromName').text()
  tradeObj['games'] = []
  tradeObj['gamesIn'] = []
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
      playerDropDown.val('')
      playerDropDown.hide()
    }
  })

  currentPlayers.html('')
  currentPlayers.append('<li id="players"></li>')
  playerList.forEach(function(player) {
    $('#players').append(
      '<li>' + player.clientName + '<img id="logo" src="/img/' + player.auth + '.png"/></li>'
    )
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

    tradeObj.gamesIn = trade.games

    playerIn.html(trade.sentFromName)
    tradeWindowIn.html('')
    acceptedByTrader.html('')
    otherTraderAccepted = false
    messageBox.html('Trade updated')
    
    displayIncomingGames(tradeObj.gamesIn)

  } else if ((trade.sentFromId === tradeObj.tradeInProgress) && trade.clearTrade) {

    clearTradeObject()
    updateTradeableCards()
    clearTrade()
    messageBox.html('Trade cleared')

  } else if (trade.sentFromId !== tradeObj.tradeInProgress) {

    socket.emit('busy', trade)

  }
})

socket.on('busy', function(msg) {
  clearTrade()
  tradeWindowIn.html('<h4>' + msg + '</h4>')
  messageBox.html('<h4>' + msg+ '</h4>')
  clearTradeObject()
  updateTradeableCards()
})

socket.on('dc', function(msg) {
  clearTrade()
  clearTradeObject()
  updateTradeableCards()
  messageBox.html('Homeboy disconnected. Start another trade!')
})

var otherTraderAccepted = false

socket.on('other trader accepted trade conditions', function(tradeObj) {
  acceptedByTrader.html('<div><h4>Other guy likes the trade conditions</h4></div>')
  messageBox.html('If you really want to make this trade, hit accept trade')
  if(otherTraderAccepted) {
    acceptedByTrader.html('<h1>Trade finalized</h1>')
  }
  otherTraderAccepted = true
})

socket.on('other trader finalized trade conditions', function() {
  acceptTrade.hide()
  clearOutTrade.hide()
  messageBox.html('<h1>Trade finalized</h1>')
  setTimeout(function(){
    clearTradeObject()
    updateTradeableCards()
    acceptTrade.show()
    clearOutTrade.show()
    clearTrade()
  }, 10000)     
})

acceptTrade.on('click', function() {
  if(otherTraderAccepted) {
    var tradeInfo = {
      gamesA: tradeObj.games,
      gamesB: tradeObj.gamesIn,
      traderA: tradeObj.sentFromId,
      traderB: tradeObj.tradeInProgress
    }
    if(!tradeInfo.gamesA) {
      tradeInfo['gamesA'] = []
    }
    if(!tradeInfo.gamesB) {
      tradeInfo['gamesB'] = []
    }
    socket.emit('confirm trade', tradeObj)
    makeTrade(tradeInfo)
    suggestion.html('')
    acceptTrade.hide()
    clearOutTrade.hide()
    acceptedByTrader.html('<h1>Trade finalized</h1>')
    setTimeout(function(){
      acceptTrade.show()
      clearOutTrade.show()
      clearTradeObject()
      updateTradeableCards()
      clearTrade()
    }, 10000)   
  }
  if(tradeObj.tradeInProgress) {
    acceptedByTrader.html('Waiting on a response')
    socket.emit('accept trade', tradeObj)
  } else {
    acceptedByTrader.html('<div><h4>You must be trading with somebody to accept the trade</h4></div>')
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

    if(tradeObj.tradeInProgress) {
      messageBox.html('Trade updated')
    }
    tradeObj.games.push(id)
    console.log(tradeObj.games)
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
    console.log(tradeObj.games)

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
            '<h3 class="text-center">' + val.name + '</h3>' + 
            '<h6 class="text-center">' + val.code + '</h6>' +
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
