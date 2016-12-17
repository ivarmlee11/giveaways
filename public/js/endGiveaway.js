$(function() {
  var url = window.location.href;

  url = url.split('/');

  var idx = url[url.length -1];

  $('#endGiveaway').on('click', function() {
    var url = '/admin/adminListEndGiveaway/' + idx;
    console.log('url ' + url);
    console.log('button clicked');
    $.ajax({
      url: url,
      type: 'GET',
      success: function(data) {  
        $('#endGiveaway').text('Giveaway has ended')
      }
    });
  });

});