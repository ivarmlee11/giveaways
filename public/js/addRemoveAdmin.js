$(function() {

$('#removeAdmin').on('click', function(e) {
  // e.preventDefault();
  var dataObj = {};
  var adminName = $('#adminNameGive').val();
  dataObj['adminName'] = adminName;

  $('input[name=auth]:checked').val();

  $.ajax({
    method: 'POST',
    url: '/admin/adminListRemove',
    data: data
  }).done(function(data) {
  });
});

});