$(function() {

  var checkIps = function(list) {
    var ipChecker = {},
        list = list;
    list.forEach(function(val) {
      if(!ipChecker[val]) {
        ipChecker[val] = 1;
        val.ipsame = 1;
      } else {
        ipChecker[val]++;
        val.ipsame++;
      }
    });
    list.forEach(function(val) {
      if(!ipChecker[val]) {
        ipChecker[val] = 1;
        val.ipsame = 1;
      } else {
        ipChecker[val]++;
        val.ipsame++;
      }
    });
    return list;
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
          $('span[giveawayId=' + val + ']').text('There are ' + playerList.length + ' entries.');
          if(playerList.length === 1) {
            $('span[giveawayId=' + val + ']').text('There is ' + playerList.length + ' entry.');
          }
          $('ul[playerListId=' + val + ']').html('<li></li>');
          var playerList = checkIps(playerList);
          playerList.forEach(function(player) {
            console.log(player)
            if(player.ipsame) {
              console.log('ip is same');
              $('ul[playerListId=' + val + ']').append('<li><strong>' + player.username + '</strong><img id="logo" src="/img/' + player.auth + '.png"/>!</li>');
            } else {
              $('ul[playerListId=' + val + ']').append('<li>' + player.username + '<img id="logo" src="/img/' + player.auth + '.png"/></li>');
            }
          });
        }
      });
    });
  };

  getPlayers();   
  // setInterval(getPlayers, 10000);
});