

$(function() {

var gameTable = $('#gameTable')

$("#csv-file").on('change', function() {
  setTimeout(function(){
    console.log('games updated')
    update()
  }, 3000);
})

update()

function update() {
  $.ajax({
    url: '/game/gameDataOnly',
    type: 'GET',
    success: function(data) {
      gameTable.html('')
      
      var data = data;

      gameTable.append(
        '<thead>' + 
        '<tr><th>Game Name</th><th>Owned</th></tr>' +
        '<tbody id="tBody">' +
        '</tbody>' + 
        '</thead>' 
      )

      data.forEach(function(val) {
        var ownedId,
            name
        if(val.owned) {
          ownedId = val.userId
          var url = '../playerData/' + ownedId
          $.ajax({
            url: url,
            type: 'GET',
            success: function(data) {
              name = data.username
              console.log(name)
              $('#tBody').append(
                '<tr>' +
                '<td>' + val.name + '</td>' + 
                '<td>' + name + '</td>' + 
                '</tr>'
              )
            }
          })
        } else {
          name = 'No'
        $('#tBody').append(
          '<tr>' +
          '<td>' + val.name + '</td>' + 
          '<td>' + name + '</td>' + 
          '</tr>'
        )
        }
      })
    }
  })
}

  
})