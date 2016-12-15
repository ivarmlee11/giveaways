$(function() {

var newArray  = function(playerList) {
  var ipData = {},
      playerListWithIpInfo = [];
  
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
  giveawayIds.forEach(function(val) {
    var url = '/admin/playerListData/' + val;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(playerList) {
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
  giveawayIds.forEach(function(val) {
    var url = '/getContestWinners/' + val;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(winnerList) {
        $('ul[winnerListId=' + val + ']').html('<li></li>');
        var updatedWinnerList = newArray(winnerList);
        updatedPlayerList.forEach(function(player) {
          $('ul[winnerListId=' + val + ']').append('<li><strong>' + player.userName + '</strong></span><img id="logo" src="/img/' + player.auth + '.png"/>!</li>');

        });
      }
    });
  });
};

getPlayersandWinners();   
setInterval(getPlayersandWinners, 10000);
});