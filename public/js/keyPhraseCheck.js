$(function() {

  var keyPhraseListById = [];

  $.ajax({
    method: 'GET',
    url: '/giveawayData'
  }).done(function(data) {
    console.log(data);
  });

});