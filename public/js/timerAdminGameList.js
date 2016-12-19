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

  var giveawayIdInts = [];

  giveawayIds.forEach(function(val) {
    var int = parseInt(val);
    giveawayIdInts.push(int);
  });

  var contestStartTime;

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
        if(giveawayData.timer === 3) {
          endTime = moment(startTime).add(3, 'minutes').utc().format();
          $(timerId).text('The giveaway is on a 3 min timer.');
          $(timerDisplayId).html(

            );
        } else if(giveawayData.timer === 5) {
          endTime = moment(startTime).add(5, 'minutes').utc().format();
          $(timerId).text('The giveaway is on a 5 min timer.');
          $(timerDisplayId).html(

            );      
        } else if(giveawayData.timer === 10) {
          endTime = moment(startTime).add(10, 'minutes').utc().format(); 
          $(timerId).text('The giveaway is on a 10 min timer.');
          $(timerDisplayId).html(

            );   
        } else {
          endTime = null;
          $(timerId).text('This giveaway is not timed.');
        }
        console.log('start time ' + startTime)
        console.log('current time ' + currentTime);
        console.log('end time ' + endTime);



        console.log(moment.utc(moment(endTime).diff(moment(currentTime))).format("HH:mm:ss"));
      }
    });
  });

});