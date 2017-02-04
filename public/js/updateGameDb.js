$(function() {

var gameTable = $('#gameTable')

  $.ajax({
    url: '/game/gameDataOnly',
    type: 'GET',
    success: function(data) {
      console.log(data)
      gameTable.html('')
      gameTable.append(
        '<thead><tr><th>Game Name</th><th>Price Range</th><th>Owned</th></thead>'
      )
    }
  })

})