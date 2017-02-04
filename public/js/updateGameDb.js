function update() {
  $.ajax({
    url: '/game/gameDataOnly',
    type: 'GET',
    success: function(data) {
      console.log(data)
      gameTable.html('')
      gameTable.append(
        '<thead><tr><th>Game Name</th><th>Price Range</th><th>Code</th><th>Owned</th></thead>'
      )
    }
  })
}

$(function() {

var gameTable = $('#gameTable'),
    updateGames = update()
    
$("#csv-file").change(updateGames)
update();
})