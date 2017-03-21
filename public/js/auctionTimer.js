$(function() {

var $timerMessage = $('#timerMessage'),
    $timerDisplay = $('#timerDisplay'),
    $kiwiCoinDisplay = $('#kiwiCoinDisplay'),
    $myId = $('#myId').text(),
    $myIdInt = parseInt($myId),
    $currentKiwis = $('#kiwiCoinDisplay').text(),
    $auctionData = $('#auctionData'),
    $auctionName = $('#auctionName'),
    $auctionPrize = $('#auctionPrize'),
    $highestBidder = $('#highestBidder'),
    $highestBid = $('#highestBid'),
    $userId = $('#userId')

$userId.val($myIdInt)

function displayAuctionData() {
  $.ajax({
    type: 'GET',
    url: '/auction/auctionData',
    success: function(auction) {
      // console.log(auction)
      if(auction !== 'None') {
        var points = 0

        if(auction.highestBid) {
          points = auction.highestBid
        }
        $highestBid.text(points)     
        getGameData(auction.gameId)
        getHighestBidderInfo(auction.userId)
      }
      kiwiCoinDisplay($myIdInt)
    }
  })
}

setTimeout(function(){ 
  displayAuctionData()
  console.log('set timeout ran')
}, 10000)

displayAuctionData()

function getHighestBidderInfo(id) {
  var url = '/playerData/' + id 
  if(id) {
    $.ajax({
      type: 'GET',
      url: url,
      success: function(user) {
        $highestBidder.text(user.username)
      }
    })
  } else {
    $highestBidder.text('None')
  }
}

function getGameData(gameId) {
  var url = '/game/gameData/' + gameId
  $.ajax({
    type: 'GET',
    url: url,
    success: function(game) {
      $auctionPrize.text(game.name)
    }
  })
}

function kiwiCoinDisplay(myUserId) {
  var url = '/kiwi/user/' + myUserId
  $.ajax({
    type: 'GET',
    url: url,
    success: function(kiwi) {
      $kiwiCoinDisplay.html(kiwi.points)
    }
  })
}


function diffInSeconds(string) {
  var splitString = string.split(':'),
      mins = parseInt(splitString[0]),
      seconds = parseInt(splitString[1]),
      totalSeconds = (mins * 60) + seconds
  return totalSeconds
}

function remakeTimer() {
  var url = '/auction/auctionData/'

  $.ajax({
    url: url,
    type: 'GET',
    success: function(auction) {
      // console.log(auction)
      if(auction !== 'None') {
        var startTime = moment(auction.createdAt).utc().format(),
            currentTime = moment.utc().format(),
            endTime

        if(!auction.ended) {
          if(auction.timer === 3) {
            endTime = moment(startTime).add(3, 'minutes').utc().format()
            var remainingTime = moment.utc(moment(endTime).diff(moment(currentTime))).format("mm:ss"),
                timerSeconds = diffInSeconds(remainingTime),
                timerString =  '<div id="' + 3 + '" data-timer="' + timerSeconds + '"></div>'


            $timerMessage.text('The auction is on a 3 min timer.')
            $timerDisplay.html(timerString)
            if(moment(currentTime).isBefore(endTime, 'seconds')) {
              $('#3').TimeCircles({count_past_zero: false})
            } else {
              $timerMessage.text('Auction is over.')
            }
          } else if(auction.timer === 5) {
            endTime = moment(startTime).add(5, 'minutes').utc().format()
            var remainingTime = moment.utc(moment(endTime).diff(moment(currentTime))).format("mm:ss"),
                timerSeconds = diffInSeconds(remainingTime),
                timerString =  '<div id="' + 5 + '" data-timer="' + timerSeconds + '"></div>'


            $timerMessage.text('The auction is on a 5 min timer.')
            $timerDisplay.html(timerString)
            if(moment(currentTime).isBefore(endTime, 'seconds')) {
              $('#5').TimeCircles({count_past_zero: false})
            } else {
              $timerMessage.text('Auction is over.')
            }
          } else if(auction.timer === 10) {
            endTime = moment(startTime).add(10, 'minutes').utc().format()
            var remainingTime = moment.utc(moment(endTime).diff(moment(currentTime))).format("mm:ss"),
                timerSeconds = diffInSeconds(remainingTime),
                timerString =  '<div id="' + 10 + '" data-timer="' + timerSeconds + '"></div>'
                

            $timerMessage.text('The auction is on a 10 min timer.')
            $timerDisplay.html(timerString)
            if(moment(currentTime).isBefore(endTime, 'seconds')) {
              $('#10').TimeCircles({count_past_zero: false})
            } else {
              $timerMessage.text('Auction is over.')
            }
          }
        } else {
          $timerMessage.text('This auction has ended.')
        }
      }
    }
  })
}
remakeTimer()

window.onresize = function(event) {
  remakeTimer()  
}


})