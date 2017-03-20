$(function() {

var $submitButton = $('#submitButton'),
    $auctionName = $('#auctionName'),
    $gameList = $('#gameList'),
    $form = $('#form'),
    $hiddenGameIdInput = $('#hiddenGameIdInput'),
    $auctionNameInput,
    $gameListInput,
    selectedAGame = false,
    $playerSelect = $('#playerSelect'),
    $kiwiCount = $('#kiwiCount'),
    $kiwiSubmit = $('#kiwSubmit'),
    playerId

$.ajax({
  url: '/player/allPlayers',
  type: 'GET',
  success: function(players) {
    var players = players
    $playerSelect.append('<option value="" disabled selected style="display:none;">Users</option>')
    players.forEach(function(player) {
      if(player.auth) {
        $playerSelect.append('<option id="' + player.id + '">' + player.username + ' ' + player.auth + '</option>')
      }
    })
  }
})

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

$playerSelect.on('change', function() {
  playerId = $('option:selected', this).attr('id')
  $kiwiSubmit.removeClass('hide')
  kiwiDisplay(playerId)
})

$kiwiSubmit.on('click', function(e) {
  e.preventDefault()
  var dataObj = {
    playerId: playerId,
    points: parseInt($kiwiCount.val())
  }
  var url = '/kiwi/user/update/' + playerId
  $.ajax({
    method: 'POST',
    url: url,
    data: dataObj,
    success: function(kiwi) {
      // $kiwiCount.val('')
      // $kiwiCount.val(kiwi.points)
      kiwiDisplay(playerId)
    }
  })
})

function kiwiDisplay(id) {
  var url = '/kiwi/user/' + id
  $.ajax({
    url: url,
    type: 'GET',
    success: function(kiwiCount) {
      $kiwiCount.val(kiwiCount.points)
    }
  })
}

$('.btn-number').click(function(e){
    e.preventDefault()
    
    fieldName = $(this).attr('data-field')
    type      = $(this).attr('data-type')
    var input = $("input[name='"+fieldName+"']")
    var currentVal = parseInt(input.val())
    if (!isNaN(currentVal)) {
      if(type == 'minus') {
          
        if(currentVal > input.attr('min')) {
            input.val(currentVal - 1).change()
        } 
        if(parseInt(input.val()) == input.attr('min')) {
            $(this).attr('disabled', true)
        }

      } else if(type == 'plus') {

        if(currentVal < input.attr('max')) {
            input.val(currentVal + 1).change()
        }
        if(parseInt(input.val()) == input.attr('max')) {
            $(this).attr('disabled', true)
        }

      }
    } else {
      input.val(0)
    }
})

$('.input-number').focusin(function(){
   $(this).data('oldValue', $(this).val())
})

$('.input-number').change(function() {
  
  minValue =  parseInt($(this).attr('min'))
  maxValue =  parseInt($(this).attr('max'))
  valueCurrent = parseInt($(this).val())
  
  name = $(this).attr('name')
  if(valueCurrent >= minValue) {
      $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
  } else {
      alert('Sorry, the minimum value was reached')
      $(this).val($(this).data('oldValue'))
  }
  if(valueCurrent <= maxValue) {
      $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
  } else {
      alert('Sorry, the maximum value was reached')
      $(this).val($(this).data('oldValue'))
  }  
})

$(".input-number").keydown(function (e) {
  // Allow: backspace, delete, tab, escape, enter and .
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
     // Allow: Ctrl+A
    (e.keyCode == 65 && e.ctrlKey === true) || 
     // Allow: home, end, left, right
    (e.keyCode >= 35 && e.keyCode <= 39)) {
       // let it happen, don't do anything
       return
  }
  // Ensure that it is a number and stop the keypress
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault()
  }
})

$form.on('change', showSubmitButton)

function showSubmitButton() {

  $auctionNameInput = $auctionName.val()
  $gameListInput = $gameList.val()

  if(($auctionNameInput.length > 0) && (selectedAGame === true)) {
    $submitButton.removeClass('hide')
  } else {
    $submitButton.addClass('hide')
  }
}

$gameList.on('change', fillGameIdHiddenInput)

function fillGameIdHiddenInput() {
  var option = $('option:selected', this).attr('id')
  selectedAGame = true
  $hiddenGameIdInput.val(option)
}

})