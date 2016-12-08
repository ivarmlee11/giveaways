$(function() {

var colorMap = {
  1: 'white',
  2: 'green',
  3: 'red',
  4: 'blue',
  5: 'yellow',
  6: 'silver'
}

var newArray  = function(playerList) {
  var ipData = {};
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
        console.log(playerList[i].ip + ' was incremented')
      } else {
        ipData[playerList[i].ip] = 1;
      }
    }
  }
  
  var playerListWithIpInfo = [];
  for(var i = 0; i < playerList.length; i++) {
    var color = 'orange';
    if(ipData[playerList[i].ip]) {
      color = colorMap[ipData[playerList[i].ip]];
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

var getPlayers = function(){
  var giveawayIds = $('.numberOfPlayer').map( function() {
    return $(this).attr('giveawayId');
  }).get();
  giveawayIds.forEach(function(val) {
    var url = '/admin/playerListData/' + val;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(playerList) {
        console.log('updated'); 
        $('span[giveawayId=' + val + ']').text('There are ' + playerList.length + ' entries.');
        if(playerList.length === 1) {
          $('span[giveawayId=' + val + ']').text('There is ' + playerList.length + ' entry.');
        }
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
};

getPlayers();   
setInterval(getPlayers, 10000);
});