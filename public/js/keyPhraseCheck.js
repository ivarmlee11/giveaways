$(function() {

  var keyPhraseListById = [];
  var list = [];

  $.ajax({
    method: 'GET',
    url: '/giveawayData'
  }).done(function(data) {
    keyPhraseListById = data;
    keyPhraseListById.forEach(function(val) {
      list.push(val.id + ',' + val.keyphrase);
    });
    console.log(list);
    console.log('list -----');

  });

});