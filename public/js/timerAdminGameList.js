$(function() {
   console.log('timer running')

  var months = {
    Jan: 01,
    Feb: 02,
    Mar: 03,
    Apr: 04,
    May: 05,
    Jun: 06,
    Jul: 07,
    Aug: 08,
    Sep: 09,
    Oct: 10,
    Nov: 11,
    Dec: 12
  };

  var giveawayIds = $('[data="ids"]').map( function() {
    return $(this).attr('giveawayId');
  }).get();

  var contestStartTime;

  var giveawayIdInts = [];

  var diffInSeconds = function(string) {
    var splitString = string.split(':'),
        mins = parseInt(splitString[0]),
        seconds = parseInt(splitString[1]),
        totalSeconds = (mins * 60) + seconds;
    console.log(totalSeconds);
    return totalSeconds;
  }

  giveawayIds.forEach(function(val) {
    var int = parseInt(val);
    giveawayIdInts.push(int);
  });

  giveawayIdInts.forEach(function(val) {

    var url = '/admin/giveawayData/' + val;

    $.ajax({
      url: url,
      type: 'GET',
      success: function(giveawayData) {
        var timerId = '#timer' + val,
            timerDisplayId = '#timerDisplay' + val,
            startTime = moment(giveawayData.createdAt).utc().format(),
            currentTime = moment.utc().format(),
            endTime;
        if(!giveawayData.ended) {
          if(giveawayData.timer === 3) {
            endTime = moment(startTime).add(3, 'minutes').utc().format();
            var remainingTime = moment.utc(moment(endTime).diff(moment(currentTime))).format("mm:ss"),
                timerSeconds = diffInSeconds(remainingTime),
                timerString =  '<div id="timer" data-timer="' + timerSeconds + '"></div>';

            $(timerId).text('The giveaway is on a 3 min timer.');
            $(timerDisplayId).html(timerString);
            $('#timer').TimeCircles();
          } else if(giveawayData.timer === 5) {
            endTime = moment(startTime).add(3, 'minutes').utc().format();
            var remainingTime = moment.utc(moment(endTime).diff(moment(currentTime))).format("mm:ss"),
                timerSeconds = diffInSeconds(remainingTime),
                timerString =  '<div id="timer" data-timer="' + timerSeconds + '"></div>';

            $(timerId).text('The giveaway is on a 3 min timer.');
            $(timerDisplayId).html(timerString);
            $('#timer').TimeCircles();   
          } else if(giveawayData.timer === 10) {
            endTime = moment(startTime).add(3, 'minutes').utc().format();
            var remainingTime = moment.utc(moment(endTime).diff(moment(currentTime))).format("mm:ss"),
                timerSeconds = diffInSeconds(remainingTime),
                timerString =  '<div id="timer" data-timer="' + timerSeconds + '"></div>';

            $(timerId).text('The giveaway is on a 3 min timer.');
            $(timerDisplayId).html(timerString);
            $('#timer').TimeCircles();
          } else {
            endTime = null;
            $(timerId).text('This giveaway is not timed.');
          }
        } else {
          $(timerId).text('This giveaway has ended.');
        }
      }
    });
  });

});