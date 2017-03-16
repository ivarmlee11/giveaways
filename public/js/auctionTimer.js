$(function() {

var $timerMessage = $('#timerMessage'),
    $timerDisplay = $('#timerDisplay')

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
      var startTime = moment(auction.createdAt).utc().format(),
          currentTime = moment.utc().format(),
          endTime

      if(!auction.ended) {
        if(auction.timer === 3) {
          endTime = moment(startTime).add(3, 'minutes').utc().format()
          var remainingTime = moment.utc(moment(endTime).diff(moment(currentTime))).format("mm:ss"),
              timerSeconds = diffInSeconds(remainingTime),
              timerString =  '<div id="' + 3 + '" data-timer="' + timerSeconds + '"></div>'

          console.log(timerSeconds)

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

          console.log(timerSeconds)

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
              
          console.log(timerSeconds)

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
  })
}
remakeTimer()

window.onresize = function(event) {
  remakeTimer()  
}


})