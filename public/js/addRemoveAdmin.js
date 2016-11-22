$(function() {

$('#removeAdmin').on('click', function(e) {
  // e.preventDefault();
  var dataObj = {};
  var adminName = $('#adminNameGive').val();
  dataObj['adminName'] = adminName;
  console.log($('#authTwitch').val());
  console.log($('#authBeam').val());

  $.ajax({
    method: 'POST',
    url: '/admin/adminListRemove',
    data: data
  }).done(function(data) {
  });
});

});