$(function() {
  console.log('trading cards');
  $('#updateCards').on('click', function(){
    updateCards();
  });
  function updateCards() {
    var url = '/game/winnerCard'
   $.ajax({
    url: url,
    type: 'GET',
    success: function(cardList) {
      cardList.forEach(function(val) {
        console.log(val);
      })
    }
  });
  };
});
