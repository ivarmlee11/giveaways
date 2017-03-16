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

$editAuthChoiceFieldset.addClass('hide')
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
    console.log('games updated')
    update()
  }, 3000)
})

var idForUserInfo = function(url, userId, gameId, getAuth) {
  $.ajax({
    url: url,
    type: 'GET',
    success: function(data) {
      if(!getAuth) {
        var selector = '#username' + userId
        $(selector).text(data.username)

      } else {
        var selector = '#auth' + userId
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
        '<thead>' + 
        '<tr><th class="text-center">Edit</th><th class="text-center">Game Name</th><th class="text-center">Owned</th><th class="text-center">Auth</th><th>Code</th></tr>' +
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
            console.log(val.name + ' will be appended')
            $gameTable.append(
              '<tr>' +
                // removes games
                '<td><span id="' + val.id + '" class="glyphicon glyphicon-minus remove"></span>' +
                '  ' +
                // edits games
                '<span id="' + val.id + '" userId="' + val.userId + '" class="glyphicon glyphicon-pencil edit"></span></td>' +
                '<td id="game' + val.id + '">' + val.name + '</td>' + 
                '<td id="username' + val.userId + '"></td>' + 
                '<td id="auth' + val.userId + '"></td>' + 
                '<td id="code' + val.id + '">' + val.code + '</td>' + 
              '</tr>'
            )
          } else { 
            console.log(val.name + ' will be appended')
            $gameTable.append(
              '<tr>' +
                // removes games
                '<td><span id="' + val.id + '" class="glyphicon glyphicon-minus remove"></span>' +
                '  ' +
                // edits games
                '<span id="' + val.id + '" class="glyphicon glyphicon-pencil edit"></span></td>' +
                '<td id="game' + val.id + '">' + val.name + '</td>' + 
                '<td class="text-center">No</td>' + 
                '<td></td>' + 
                '<td id="code' + val.id + '">' + val.code + '</td>' + 
              '</tr>'
            )
          }

        } else {
          console.log(val.name + ' had its code revealed by user ' + val.userId)
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
      userNameSelector = '#username' + userId,
      userAuthSelector = '#auth' + userId,
      $thisRow = $(this).parent().parent()

  $('.glyphicon-pencil').hide()
  $('.glyphicon-minus').hide()
  $gameAddForm.addClass('hide')
  $gameEditForm.removeClass('hide')
  $thisRow.addClass('yellow')

  bootbox.confirm('Sure you want to edit this game?', function(result) {
    if(result) {
      $editAuthChoiceFieldset.removeClass('hide')
      var gameCodeString = $(gameCodeSelector).text()
      console.log(' game code stinrg ' + gameCodeString)
      $editGameCode.val(gameCodeString)

      var gameIdString = gameId.toString()
      $currentGameId.val(gameIdString)

      var editGameSelector = $(gameIdSelector).text()
      console.log(editGameSelector + ' game id selector')

      $editGameName.val(editGameSelector)
      
      var editGameOwner = $(userNameSelector).text()
      console.log(editGameOwner + ' game owner')

      if(editGameOwner !== undefined) {
        $editGameOwner.val(editGameOwner)
      }

      var editGameAuth = $(userAuthSelector).text()
      console.log(editGameAuth + ' owners auth choice')

      if(editGameAuth === 'Twitch') {
        console.log('twitch should be checked')
        $editAuthChoiceTwitch.attr('checked', true)
        $editAuthChoiceTwitch.addClass('yellow')
      } else if (editGameAuth === 'Beam') {
        console.log('beam should be checked')
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

update()
  
})