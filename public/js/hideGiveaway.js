$(function() {
  
var url = window.location.href

url = url.split('/')

var idx = url[url.length -1]

$('#hideThis').on('click', function() {
  var url = '/giveaway/hideGiveaway/' + idx
  $.ajax({
    url: url,
    type: 'GET',
    success: function(data) { 
      console.log(data)
      $('#endGiveaway').text('Giveaway ended.')
      $('#timer').hide()
      // window.location.href = 'https://tweak-game-temp.herokuapp.com' + url      
    }
  })
})

})