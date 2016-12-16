$(function() {

var val;

var newArray  = function(playerList) {
  var ipData = {},
      playerListWithIpInfo = [];
  // console.log(JSON.Stringify(playerList))
  console.log('player list')
  playerList.sort(function(a, b){
    var ipA=a.ip,
        ipB=b.ip;
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
      ipData[playerList[i].ip] = 1;
    } else {
      if(ipData.hasOwnProperty(playerList[i].ip)) {
        ipData[playerList[i].ip]++;
      } else {
        ipData[playerList[i].ip] = 1;
      }
    }
  }
  
  for(var i = 0; i < playerList.length; i++) {
    if(ipData[playerList[i].ip]) {
      var rgb = playerList[i].ip.split('.'),
          red = rgb[0],
          green = rgb[1],
          blue = rgb[2];
      color = 'rgb(' + red + ',' + green + ',' + blue + ')';
    }
    playerListWithIpInfo.push({
      ipCount: ipData[playerList[i].ip],
      userName: playerList[i].username,
      auth: playerList[i].auth,
      ip: playerList[i].ip,
      color: color
    })
  }
  
  return playerListWithIpInfo;
}

var getPlayersandWinners = function(){
  var giveawayIds = $('.numberOfPlayer').map( function() {
    return $(this).attr('giveawayId');
  }).get();
  // console.log(giveawayIds)
  giveawayIds.forEach(function(val) {
    val = val;
    var url = '/admin/playerListData/' + val;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(playerList) {
        // console.log(playerList)
        // console.log('found players')
        $('ul[playerListId=' + val + ']').html('<li></li>');
        var updatedPlayerList = newArray(playerList);
        updatedPlayerList.forEach(function(player) {
          if(player.ipCount > 1) {
            $('ul[playerListId=' + val + ']').append('<li><span style="background-color:' + player.color + '"><strong>' + player.userName + '</strong></span><img id="logo" src="/img/' + player.auth + '.png"/>!</li>');
          } else {
            $('ul[playerListId=' + val + ']').append('<li>' + player.userName + '<img id="logo" src="/img/' + player.auth + '.png"/></li>');
          }
        });
      }
    });
  });
  console.log('winner check')
  console.log('giveaway ids')
  console.log(giveawayIds[0])
  var url2 = '/getContestWinners/' + val;
  $.ajax({
    url: url2,
    type: 'GET',
    success: function(winnerList) {
      console.log(winnerList)
      console.log('found winners')
      $('ul[winnerListId=' + val + ']').html('<li></li>');

      // var updatedWinnerList = newArray(windowinnerList);
      var winnerLxist = winnerList.winners;

      winnerList.forEach(function(player) {
        console.log(player.username + ' winner found');
        $('ul[winnerListId=' + val + ']').append('<li><strong>' + player.username + '</strong></span><img id="logo" src="/img/' + player.auth + '.png"/></li>');

      });
    }
  });
};

getPlayersandWinners();   
// setInterval(getPlayersandWinners, 10000);
});