$(function() {

  var checkIps = function(playerList) {
   
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
    // console.log(playerList);
    var ipNumber = [];
    playerList.forEach(function(element) {
      if(ipNumber.length === 0) {
        ipNumber.push({
          username: element.username,
          ip: element.ip,
          auth: element.auth,
          numberofips: 1
        })
      } else {
        for(var i = 0; i <= ipNumber.length; i++) {
          // if(ipNumber[i]) {
            if(element.username !== ipNumber[i].username) {
              ipNumber.push({
                username: element.username,
                ip: element.ip,
                auth: element.auth,
                numberofips: 1
              })
            } else {
              ipNumber.push({
                username: element.username,
                ip: element.ip,
                auth: element.auth,
                numberofips: ipNumber[i].numberofips++
              })
            }
          // }
          // console.log(i)
        }
      }
    });
    console.log(ipNumber);


    return newList;
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
            if(player.numberofips > 1) {
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