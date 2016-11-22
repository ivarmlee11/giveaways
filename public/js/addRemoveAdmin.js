$(function() {

$('#removeAdmin').on('click', function(e) {
  // e.preventDefault();
  var adminName = $('#adminNameGive').val();
  console.log(adminName);
  console.log(typeof adminName);

  $.ajax({
    method: 'POST',
    url: '/admin/adminListRemove',
    data: adminName
  }).done(function(data) {
  });
});

});