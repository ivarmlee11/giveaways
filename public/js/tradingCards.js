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
    sentFromId = $('#sentFromId').text(),
    sentFromIdInt = parseInt(sentFromId),
    acceptedByTrader = $('#acceptedByTrader'),
    tradeInProgressIndicator = $('#tradeInProgress'),
    tradeObject = {},
    playerNames = [],
    playerList = []

tradeObject['sentFromId'] = sentFromIdInt
tradeObject['sentFromName'] = $('#sentFromName').text()
tradeObject['games'] = []
tradeObject['agreeOnTerms'] = false
tradeObject['tradeInProgress'] = false
tradeObject['incomingTrade'] = {}
tradeObject['clearTrade'] = false

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
      tradeObject.tradeInProgress = player.data
      // console.log(tradeObject)
      sendTrade(tradeObject)
      suggestion.html('Send to ' + player.value)
      playerDropDown.hide()
    }
  })

  currentPlayers.html('')
  playerList.forEach(function(player) {
    currentPlayers.append('<h6 userid="' + player.id + '">' + player.clientName + '<img id="logo" src="/img/' + player.auth + '.png"/></h6>')
  })
})

function sendTrade(tradeObj) {
  socket.emit('send trade', tradeObj)
}

socket.on('get trade', function(trade) {
  console.log('getting trade')
  console.log(trade)
  tradeObject.incomingTrade = trade.games
  displayIncomingGames(trade.games)
})

tradeWindowOut.droppable({
  drop: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)

    tradeObject.games.push(id)
    // console.log(tradeObject)
    sendTrade(tradeObject)
  },
  out: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)

    tradeObject.games = tradeObject.games.filter(function(gameId) {
      return gameId !== id
    })
    // console.log(tradeObject)
    sendTrade(tradeObject)
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
    tradeWindowIn.html('No games were sent')
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
