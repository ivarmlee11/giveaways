$(function() {

var $gameTable = $('#gameTable'),
    $message = $('#message'),
    $refresh = $('#refresh'),
    $currentGameId = $('#currentGameId'),
    $editGameName = $('#editGameName'),
    $editGameCode = $('#editGameCode'),
    $editGameOwner = $('#editGameOwner'),
    $editAuthChoiceTwitch = $('#editAuthChoiceTwitch'),
    $editAuthChoiceBeam = $('#editAuthChoiceBeam'),
    $gameEditForm = $('#gameEditForm')

var $addGameName = $('#addGameName'),
    $addGameCode = $('#addGameCode'),
    $addGameOwner = $('#addGameOwner'),
    $addAuthChoiceTwitch = $('#addAuthChoiceTwitch'),
    $addAuthChoiceBeam = $('#addAuthChoiceBeam'),
    $gameAddForm = $('#gameAddForm'),
    $tBody = $('#tBody')

var $addAuthChoiceFieldset = $('#addAuthChoiceFieldset'),
    $editAuthChoiceFieldset = $('#editAuthChoiceFieldset')

var $clearEdit = $('#clearEdit'),
    $clearAdd = $('#clearAdd')

$refresh.on('click', function(e) {
  e.preventDefault()
  $gameEditForm.addClass('hide')
  $gameAddForm.removeClass('hide')
  update()
})

$clearEdit.on('click', function(e) {
  e.preventDefault()
  $editGameOwner.val('')
  $addAuthChoiceFieldset.attr('checked', false)
  $editAuthChoiceFieldset.addClass('hide')
})

$clearAdd.on('click', function(e) {
  e.preventDefault()
  $addGameOwner.val('')
  $editAuthChoiceFieldset.attr('checked', false)
  $editAuthChoiceFieldset.addClass('hide')
})

$addGameOwner.on('keyup', function() {
  if($(this).val().length > 0) {
    $addAuthChoiceFieldset.attr('checked', false)
    $addAuthChoiceFieldset.removeClass('hide')
  } else {
    $addAuthChoiceFieldset.addClass('hide')
  }
})

$editGameOwner.on('keyup', function() {
  if($(this).val().length > 0) {
    $editAuthChoiceFieldset.attr('checked', false)
    $editAuthChoiceFieldset.removeClass('hide')
  } else {
    $editAuthChoiceFieldset.addClass('hide')
  }
})

$("#csv-file").on('change', function() {
  setTimeout(function(){
    update()
  }, 3000)
})

var idForUserInfo = function(url, userId, gameId, getAuth) {
  $.ajax({
    url: url,
    type: 'GET',
    success: function(data) {
      if(!getAuth) {
        var selector = '.username' + userId
        $(selector).text(data.username)

      } else {
        var selector = '.auth' + userId
        $(selector).text(data.auth)
      }
    }
  })
}

function update() {
  $.ajax({
    url: '/game/gameDataOnly',
    type: 'GET',
    success: function(data) {
      $gameTable.html('')
      
      var data = data

      $gameTable.append(
        '<thead class="text-center">' + 
        '<tr><th class="text-center">Edit</th><th class="text-center">Game Name</th><th class="text-center">Owned</th><th class="text-center">Auth</th><th class="col-lg-3 text-center">Code</th></tr>' +
        '</thead>' 
      )

      data.forEach(function(val) {
    
        if(!val.coderevealed) {
          if(val.owned) {
            var url = '/player/playerInfo/' + val.userId,
                gameId = val.id,
                userId = val.userId
            idForUserInfo(url, userId, gameId, false)
            idForUserInfo(url, userId, gameId, true)
            $gameTable.append(
              '<tr class="text-center">' +
                // removes games
                '<td><span id="' + val.id + '" class="glyphicon glyphicon-minus remove"></span>' +
                '  ' +
                // edits games
                '<span id="' + val.id + '" userId="' + val.userId + '" class="glyphicon glyphicon-pencil edit"></span>' +
                '  ' + 
                // reveal code on this row
                '<span id="' + val.id + '" userId="' + val.userId + '" class="glyphicon glyphicon-eye-open show"></span></td>' +
                '<td id="game' + val.id + '">' + val.name + '</td>' + 
                '<td class="username' + val.userId + '"></td>' + 
                '<td class="auth' + val.userId + '"></td>' + 
                '<td><h6 id="code' + val.id + '" class="hide">' + val.code + '</h6></td>' + 
              '</tr>'
            )
          } else { 
            $gameTable.append(
              '<tr class="text-center">' +
                // removes games
                '<td><span id="' + val.id + '" class="glyphicon glyphicon-minus remove"></span>' +
                 '  ' +
                // edits games
                '<span id="' + val.id + '" class="glyphicon glyphicon-pencil edit"></span>' +
                '  ' + 
                // reveal code on this row
                '<span id="' + val.id + '" userId="' + val.userId + '" class="glyphicon glyphicon-eye-open show"></span></td>' +
                '<td id="game' + val.id + '">' + val.name + '</td>' + 
                '<td>No</td>' + 
                '<td></td>' + 
                '<td><h6 id="code' + val.id + '" class="hide">' + val.code + '</h6></td>' + 
              '</tr>'
            )
          }

        }
      })
    }
  })
}  

$(document).on('click', '.edit', function() {
  var gameId = $(this).attr('id'),
      userId = $(this).attr('userId'),
      gameCodeSelector = '#code' + gameId,
      gameIdSelector = '#game' + gameId,
      userNameSelector = '.username' + userId,
      userAuthSelector = '.auth' + userId,
      $thisRow = $(this).parent().parent()

  $('.glyphicon-pencil').hide()
  $('.glyphicon-minus').hide()
  $gameAddForm.addClass('hide')
  $gameEditForm.removeClass('hide')
  $editAuthChoiceFieldset.addClass('hide')
  $thisRow.addClass('yellow')

  bootbox.confirm('Sure you want to edit this game?', function(result) {
    if(result) {
      $editAuthChoiceFieldset.removeClass('hide')
      var gameCodeString = $(gameCodeSelector).text()
      $editGameCode.val(gameCodeString)

      var gameIdString = gameId.toString()
      $currentGameId.val(gameIdString)

      var editGameSelector = $(gameIdSelector).text()

      $editGameName.val(editGameSelector)
      
      var editGameOwner = $(userNameSelector).text()

      if(editGameOwner !== undefined) {
        $editGameOwner.val(editGameOwner)
      }

      var editGameAuth = $(userAuthSelector).text()

      if(editGameAuth === 'Twitch') {
        $editAuthChoiceTwitch.attr('checked', true)
        $editAuthChoiceTwitch.addClass('yellow')
      } else if (editGameAuth === 'Beam') {
        $editAuthChoiceBeam.attr('checked', true)
        $editAuthChoiceBeam.addClass('yellow')

      }  

    } else {
      $gameAddForm.removeClass('hide')
      $gameEditForm.addClass('hide')
      $thisRow.removeClass('yellow')
      $('.glyphicon-pencil').show()
      $('.glyphicon-minus').show()
    }
    $editAuthChoiceFieldset.addClass('hide')

  })

})

$(document).on('click', '.remove', function() {
  var gameId = $(this).attr('id'),
      url = '/game/removeGame/' + gameId

  bootbox.confirm('Sure you want to delete this game?', function(result) {
    if(result) {
      $.ajax({
        url: url,
        type: 'GET',
        success: function(data) {
          $message.text('Game removed.')
          update()
        }
      })      
    }
  })
})

$(document).on('click', '.show', function() {
  var id = $(this).attr('id'),
    selector = '#code' + id

  $(selector).toggleClass('hide')

})

update()
  
})