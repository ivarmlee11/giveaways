

$(function() {

var gameTable = $('#gameTable'),
    updateGames = update()

$("#csv-file").change(updateGames)
update();



function update() {
  $.ajax({
    url: '/game/gameDataOnly',
    type: 'GET',
    success: function(data) {
      gameTable.html('')
      
      var data = data;

      gameTable.append(
        '<thead>' + 
        '<tr><th>Game Name</th><th>Price Range</th><th>Code</th><th>Owned</th></tr>' +
        '<tbody id="tBody">' +
        '</tbody>' + 
        '</thead>' 
      )

      data.forEach(function(val) {
        $('#tBody').append(
          '<tr>' +
          '<td>' + val.name + '</td>' + 
          '<td>' + val.price + '</td>' + 
          '<td>' + val.code + '</td>' + 
          '<td>' + val.owned + '</td>' + 
          '</tr>'
        )
      })
    }
  })
}

  
})