$(function() {
  var url = window.location.href;

  url = url.split('/');

  var idx = url[url.length -1];

  $('#deleteThis').on('click', function() {
    var url = '/admin/deleteGiveaway/' + idx;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(data) {       
        window.location.href = 'https://tweak-game-temp.herokuapp.com' + url;       
      }
    });
  });

});