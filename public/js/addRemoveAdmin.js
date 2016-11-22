$(function() {

$('#removeAdmin').on('click', function(e) {
  e.preventDefault();
  var data = $('#adminNameGive').val();
  console.log(data);
  console.log(typeof data);

  $.ajax({
    method: 'POST',
    url: '/admin/adminListRemove',
    data: data
  }).done(function(data) {
  });
});

});