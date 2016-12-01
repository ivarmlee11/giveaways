$(function() {
  var url = window.location.href;

  url = url.split('/');

  var idx = url[url.length -1];

  $('#endGiveaway').on('click', function() {
    var url = '/admin/adminListEndGiveaway/' + idx;
    $.ajax({
      url: url,
      type: 'GET',
      success: function(data) {  
        console.log('giveaway ended');
        $('#endGiveaway').text('Ended.')
      }
    });
  });

});