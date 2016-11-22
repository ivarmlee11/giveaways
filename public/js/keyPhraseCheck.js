$(function() {

  var keyPhraseListById = [];
  var list = {};

  var $links = $('.links');
  $links.hide();

  $.ajax({
    method: 'GET',
    url: '/giveawayData'
  }).done(function(data) {
    keyPhraseListById = data;
    keyPhraseListById.forEach(function(val) {
      list[val.id] = val.keyphrase;
      // list.push(val.id + ',' + val.keyphrase);
    });
    console.log(list);
    console.log('list -----');

  });

});