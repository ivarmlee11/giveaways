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
    suggestion = $('#suggestion'),
    acceptedByTrader = $('#acceptedByTrader'),
    tradeIplanfoOut = new TradeWindow(null, [], null, null, null, null),
    tradeInfoIn = new TradeWindow(null, [], null, null, null, null),
    offerAccepted = {},
    tradeInProgress = false,
    tradeInProgressIndicator = $('#tradeInProgress'),
    sentFromId = $('#sentFromId').text(),
    sentFromId = parseInt(sentFromId),
    sentFromName = $('#sentFromName').text(),
    playerNames = [
    { value: 'Andorra', data: 'AD' },
    // ...
    { value: 'Zimbabwe', data: 'ZZ' }
];

  

socket.on('update players', function(connectedPlayers){
  currentPlayers.html('')
  playerTradeList.html('')
  
  var playerList = connectedPlayers,
  playerNames = playerList.map(function(player) {
    var rObj = {
      value: player.username,
      data: player.id.toString()
    }
    
    return rObj
  })

  console.log(playerNames)
  
  playerDropDown.autocomplete({
    lookup: playerNames,
    onSelect: function (player) {
      suggestion.html('You selected: ' + player.value + ', ' + player.data)
    }
  })

  playerList.forEach(function(player) {
    currentPlayers.append('<h6 userid="' + player.id + '">' + player.clientName + '<img id="logo" src="/img/' + player.auth + '.png"/></h6>')
  })
})  


tradeWindowOut.droppable({
  drop: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)


  },
  out: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)


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
