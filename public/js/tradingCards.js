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
          label: player.username,
          value: player.id
        }
        return rObj
      })
  
  playerDropDown.autocomplete({
    source: playerList
  })


  playerList.forEach(function(val) {
    playerTradeList.append('<option userid="' + val.id + '">' + val.clientName + '</option>')
  })
})

tradeWindowOut.droppable({
  drop: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)

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
        } e
      })
    }
  })
}

updateTradeableCards()
updateOwnedCards()
})
