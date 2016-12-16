$(function() {

var val;

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
    playerListWithIpInfo.push({
      ipCount: ipData[playerList[i].ip],
      username: playerList[i].username,
      auth: playerList[i].auth,
      ip: playerList[i].ip
    })
  }
  return playerListWithIpInfo;
}

var getPlayers = function(){
  var giveawayIds = $('.numberOfPlayer').map( function() {
    return $(this).attr('giveawayId');
  }).get();

  var val = giveawayIds[0],
      url = '/admin/playerListData/' + val;
      consle.log(val)
  $.ajax({
    url: url,
    type: 'GET',
    success: function(playerList) {
      $('span[giveawayId=' + val + ']').text('There are ' + playerList.length + ' entries.');
      if(playerList.length === 1) {
        $('span[giveawayId=' + val + ']').text('There is ' + playerList.length + ' entry.');
      }
      $('ul[playerListId=' + val + ']').html('<li></li>');
      var updatedPlayerList = newArray(playerList);
      updatedPlayerList.forEach(function(player) {
        $('ul[playerListId=' + val + ']').append('<li>' + player.username + '<img id="logo" src="/img/' + player.auth + '.png"/></li>');
      });
    }
  });

  var url2 = '/getContestWinners/' + val;
  $.ajax({
    url: url2,
    type: 'GET',
    success: function(winnerList) {
      $('ul[winnerListId=' + val + ']').html('<li></li>');
      var winnerList = winnerList.winners;
      winnerList.forEach(function(player) {
        $('ul[winnerListId=' + val + ']').append('<li><strong>' + player.username + '</strong></span><img id="logo" src="/img/' + player.auth + '.png"/></li>');
      });
    }
  });

};

getPlayers();   
setInterval(getPlayers, 10000);
});