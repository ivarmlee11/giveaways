$(function() {

var val

var newArray  = function(playerList) {
  var ipData = {},
      playerListWithIpInfo = []

  playerList.sort(function(a, b){
    var ipA=a.ip,
        ipB=b.ip
    if (ipA < ipB) {
      return -1 
    }
    if (ipA > ipB) {
      return 1
    }
    return 0
  })
  
  for(var i = 0; i < playerList.length; i++) {
    if(i === 0) {
      ipData[playerList[i].ip] = 1
    } else {
      if(ipData.hasOwnProperty(playerList[i].ip)) {
        ipData[playerList[i].ip]++
      } else {
        ipData[playerList[i].ip] = 1
      }
    }
  }
  
  for(var i = 0; i < playerList.length; i++) {
    if(ipData[playerList[i].ip]) {
      var rgb = playerList[i].ip.split('.'),
          red = rgb[0],
          green = rgb[1],
          blue = rgb[2]
      color = 'rgb(' + red + ',' + green + ',' + blue + ')'
    }
    playerListWithIpInfo.push({
      ipcount: ipData[playerList[i].ip],
      username: playerList[i].username,
      auth: playerList[i].auth,
      ip: playerList[i].ip,
      color: color
    })
  }
  
  return playerListWithIpInfo
}

var getPlayersandWinners = function(){
  var giveawayIds = $('.numberOfPlayer').map( function() {
    return $(this).attr('giveawayId')
  }).get()

  
  giveawayIds.forEach(function(element) {
    var url = '/player/playerListData/' + element

    $.ajax({
      url: url,
      method: 'GET',
      success: function(playerList) {
        $('ul[playerListId=' + element + ']').html('<li></li>')
        var updatedPlayerList = newArray(playerList)
        updatedPlayerList.forEach(function(player) {
          if(player.ipcount > 1) {
            $('ul[playerListId=' + element + ']').append('<li><span style="background-color:' + player.color + '"><strong>' + player.username + '</strong></span><img id="logo" src="/img/' + player.auth + '.png"/>!</li>')
          } else {
            $('ul[playerListId=' + element + ']').append('<li>' + player.username + '<img id="logo" src="/img/' + player.auth + '.png"/></li>')
          }
        })
      }
    })

    var url2 = '/getContestWinners/' + element
    $.ajax({
      url: url2,
      type: 'GET',
      success: function(winnerList) {
        $('ul[winnerListId=' + element + ']').html('<li></li>')
        var winnerList = winnerList.winners
        winnerList.forEach(function(player) {
          $('ul[winnerListId=' + element + ']').append('<li><strong>' + player.username + '</strong></span><img id="logo" src="/img/' + player.auth + '.png"/></li>')
        })
      }
    })
  })
}

getPlayersandWinners()   
setInterval(getPlayersandWinners, 10000)
})