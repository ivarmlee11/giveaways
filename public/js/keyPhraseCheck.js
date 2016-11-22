$(function() {

  $.ajax({
    method: 'GET',
    url: '/giveawayData'
  }).done(function(data) {
    console.log(data);
  });

});