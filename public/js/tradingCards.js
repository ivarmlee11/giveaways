$(function() {

var socket = io.connect()

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

tradeObject['sentFromId'] = sentFromId
tradeObject['sentFromName'] = $('#sentFromName').text()
tradeObject['gameIdList'] = []

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
      suggestion.html('You selected: ' + player.value)
      playerDropDown.hide()
    }
  })

  currentPlayers.html('')
  playerList.forEach(function(player) {
    currentPlayers.append('<h6 userid="' + player.id + '">' + player.clientName + '<img id="logo" src="/img/' + player.auth + '.png"/></h6>')
  })
})

function sentTrade(tradeObj,sentFromId) {

}

tradeWindowOut.droppable({
  drop: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)

    tradeObject.gameIdList.push(id)
    console.log(tradeObject)
  },
  out: function(event, ui) {
    var draggable = ui.draggable,
        id = draggable.attr('gameid'),
        id = parseInt(id)

    tradeObject.gameIdList = tradeObject.gameIdList.filter(function(obj) {
      return obj.id !== id
    })
    console.log(tradeObject)
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
