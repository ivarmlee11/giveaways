$(function() {
  // $('#updateCards').on('click', function(){
  //   updateCards();
  // });
  var $tradingArea = $('#tradingArea');

  function updateCards() {
    var url = '/game/winnerCard/'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      cardList.forEach(function(val) {
        console.log(val);
        $tradingArea.append('<div gameId="' + val.id + '" class="cards">' + 
          '<h3>' + val.name + '</h3>' + 
          '</div>'
        )
      })
    }
  });
  updateCards();
  };
});
