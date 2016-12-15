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
    playerListWithIpInfo.push({
      ipCount: ipData[playerList[i].ip],
      userName: playerList[i].username,
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
  giveawayIds.forEach(function(val) {
    var url = '/admin/playerListData/' + val;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(playerList) {
        console.log('playerlist updated'); 
        $('span[giveawayId=' + val + ']').text('There are ' + playerList.length + ' entries.');
        if(playerList.length === 1) {
          $('span[giveawayId=' + val + ']').text('There is ' + playerList.length + ' entry.');
        }
        $('ul[playerListId=' + val + ']').html('<li></li>');
        var updatedPlayerList = newArray(playerList);
        updatedPlayerList.forEach(function(player) {
          $('ul[playerListId=' + val + ']').append('<li>' + player.userName + '<img id="logo" src="/img/' + player.auth + '.png"/></li>');
        });
      }
    });
  });
};

getPlayers();   
setInterval(getPlayers, 10000);
});