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
  tradeWindowIn.html('')
  tradeWindowOut.html('')
  playerIn.html('')
  playerDropDown.show()
  suggestion.html('')
  messageBox.html('')
}


socket.on('update players', function(connectedPlayers){
  
  playerList = connectedPlayers

  playerNames = playerList.map(function(player) {
    var playerAuth = player.clientName + ' ' + player.auth,
    rObj = {
      value: playerAuth,
      data: player.id
    }  
    console.log(player.id + ' ' + sentFromIdInt + ' ' + typeof(player.id) + ' ' + typeof(sentFromIdInt))

    return rObj
    
  })

  playerDropDown.autocomplete({
    lookup: playerNames,
    onSelect: function (player) {
      tradeObj.tradeInProgress = player.data
      tradeObj.lastTrader = player.id
      // console.log(tradeObj)
      sendTrade(tradeObj)
      suggestion.html('Trading with ' + player.value)
      messageBox.html('Trade started')
      playerDropDown.hide()
    }
  })

  currentPlayers.html('')
  playerList.forEach(function(player) {
    currentPlayers.append('<h6 userid="' + player.id + '">' + player.clientName + '<img id="logo" src="/img/' + player.auth + '.png"/></h6>')
  })
})

function sendTrade(tradeObj) {
  socket.emit('last trade', tradeObj.tradeInProgress)
  socket.emit('send trade', tradeObj)
}

socket.on('get trade', function(trade) {
  var trade = trade
  console.log('getting trade')
  console.log(trade)

  if(!tradeObj.tradeInProgress) {

    console.log('new trade started')
    console.log(tradeObj)
    
    tradeObj.tradeInProgress = trade.sentFromId
    tradeObj.gamesIn = trade.games
    tradeObj.lastTrader = trade.sentFromId
    
    playerIn.html(trade.sentFromName)
    suggestion.html('Trading with ' + trade.sentFromName)
    playerDropDown.hide()
    messageBox.html('Trade started')
    
    displayIncomingGames(tradeObj.gamesIn)

  } else if ((trade.sentFromId === tradeObj.tradeInProgress) && !trade.clearTrade) {

    console.log('current trade agreement changed')
    console.log(tradeObj)

    tradeWindowIn.html('')

    tradeObj.gamesIn = trade.games
    tradeObj.lastTrader = trade.sentFromId
    tradeObj.agreeOnTerms = false

    playerIn.html(trade.sentFromName)
    messageBox.html('Trade updated')
    
    displayIncomingGames(tradeObj.gamesIn)

  } else if ((trade.sentFromId === tradeObj.tradeInProgress) && trade.clearTrade) {

    console.log('trade cleared')
    console.log(tradeObj)
    
    tradeObj.agreeOnTerms = false
    clearTradeObject()
    
    updateTradeableCards()
    clearTrade()
    messageBox.html('Trade cleared')

  } else if (trade.sentFromId !== tradeObj.tradeInProgress) {

    console.log('somebody tried trading with you but you are busy')
    console.log(tradeObj)
    socket.emit('busy', trade)

  }
})

socket.on('busy', function(msg) {
  tradeWindowIn.html(msg)
  messageBox.html(msg)
  console.log('trade sent out to a busy client')
  console.log(tradeObj)
  clearTradeObject()
  console.log('trade after being cleared')
  console.log(tradeObj)
})

socket.on('dc', function(msg) {
  console.log('You just got cleared')
  clearTrade()
  clearTradeObject()
  updateTradeableCards()
  console.log(tradeObj)
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
  console.log(tradeObj)
})

tradeWindowOut.droppable({
  drop: function(event, ui) {
    console.log(ui.draggable)
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id),
        reveal = draggable.find('a')

    tradeObj.games.push(id)
    reveal.hide()
    // playerIn.html(tradeObj.tradeInProgress)
    // console.log(tradeObj)
    tradeObj.games = tradeObj.games.filter(function( item, index, inputArray ) {
      // console.log(item + ' item')
      // console.log(index + ' index')
      // console.log(inputArray + ' inputArray')
      // console.log(inputArray.indexOf(item) == index)
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
    // console.log(tradeObj)
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
