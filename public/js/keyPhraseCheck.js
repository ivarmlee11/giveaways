$(function() {

  $.ajax({
    method: 'GET',
    url: '/giveawayList'
  }).done(function(data) {
    console.log(data);
  });

});