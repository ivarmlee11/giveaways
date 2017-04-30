$(function() {

  var $gameList = $('#gameListGrocery'),
      $gameMessage = $('#gameMessage'),
      $gameIdInput = $('#gameIdInput'),
      $gameSelect = $('#gameSelect'),
      $noneSelect = $('#noneSelect')

  $.ajax({
    method: 'GET',
    url: '/game/gameDataOnly',
    success: function(games) {
      var games = games
      $gameList.append('<option value="" disabled selected style="display:none;">Games</option>')
      games.forEach(function(val) {
        if(!val.owned) {
          $gameList.append('<option id="' + val.id + '">' + val.name + '</option>')
        }
      })
    }
  })

  $gameSelect.on('change', function() {
    $gameList.toggleClass('hide')
  })

  $noneSelect.on('change', function() {
    $gameIdInput.val('')
    $gameList.toggleClass('hide')
  })

  $gameList.on('change', fillGameIdHiddenInput)

  function fillGameIdHiddenInput() {
    var gameId = $('option:selected', this).attr('id')
    $gameIdInput.val(gameId)
  }

})