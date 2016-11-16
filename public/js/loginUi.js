$(function() {
  $('#twitchDiv').hover(function() {
    $('#twitchDiv').addClass('hover');
    $('#twitchDiv').css("background-color","silver");
  },
function() {
    $('#twitchDiv').removeClass('hover');
    $('#twitchDiv').css("background-color","white");
  });
}); 