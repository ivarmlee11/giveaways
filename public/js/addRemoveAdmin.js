$(function() {

$('#removeAdmin').on('click', function(e) {
  // e.preventDefault();
  var data = $('#adminNameGive').val();
  $.ajax({
    method: 'POST',
    url: '/admin/adminListRemove',
    data: data
  }).done(function(data) {
  });
});

});