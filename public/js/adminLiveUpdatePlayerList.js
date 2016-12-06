$(function() {

  var checkIps = function(playerList) {
    var ipChecker = {},
    list = [];

     playerList.forEach(function(val) {
      if(!ipChecker[val.username]) {
        ipChecker[val.username] = 1;
      } else {
        ipChecker[val.username]++;
      }
    });

     console.log(ipChecker)
    playerList.forEach(function(val) {
      if(ipChecker[val.username] === 1) {
        list.push({
          ipsame: false,
          username: val.username,
          auth: val.auth,
          ip: val.ip
        });
      } else {
        list.push({
          ipsame: true,
          username: val.username,
          auth: val.auth,
          ip: val.ip
        });
      }
    });      
    console.log(list)
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
            if(player.ipsame) {
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