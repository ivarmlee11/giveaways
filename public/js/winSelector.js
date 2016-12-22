$(function() {

var url = window.location.href;

url = url.split('/');

var idx = url[url.length -1];

var winner,
    winnerReset = false,
    afterFirstSpin = false;

$('#selectWinner').on('click', function() {
  var url = '/admin/playerListData/' + idx;
  $.ajax({
    url: url,
    type: 'GET',
    success: function(players) {
      var playerList = players;
      winner = playerList[Math.floor(Math.random()*playerList.length)];
      if(winner) {
        winnerReset = true;
        $('#winner').html('The winner is ' + winner.username + '!');
      } else {
        $('#winner').html('Nobody has entered the competition yet!');
      } 
    }
  });
});

$('#addWinnerToDb').on('click', function() {
  var url = '/admin/addToWinHistory/' + idx;
  console.log(winner);
  if(winnerReset) {
    $.ajax({
      url: url,
      type: 'POST',
      data: winner,
      success: function(data) {
        console.log(data);
        winnerReset = false;
        $('#winner').html(data);
      }
    });
  } else {
    $('#winner').html('The winner has not been drawn or nobody has entered the competition yet!');
  }
});


// wheel config
// var venues =  
//   [{"name":"Guasaca", "type":"Venezuelan"},
//   {"name":"Relish", "type":"Cafe"},
//   {"name":"Panera", "type":"Cafe"},
//   {"name":"Gino's Pizza", "type":"Pizza"},
//   {"name":"Indian Buffet", "type":"Buffet"},
//   {"name":"Haru", "type":"Japanese"},
//   {"name":"Chipotle", "type":"Burritos"},
//   {"name":"Tarbouch", "type":"Mediterrenean"},
//   {"name":"Mod Pizza", "type":"Pizza"},
//   {"name":"Chubbys", "type":"Mexican"},
//   {"name":"Chick-fil-a", "type":"Fast Food"},
//   {"name":"Firehouse", "type":"Sandwiches"},
//   {"name":"All you can eat sushi", "type":"Japanese"},
//   {"name":"Char-Grill", "type":"Fast Food"},
//   {"name":"La Ranch", "type":"Mexican"},
//   {"name":"Harris Teeter", "type":"Grocery Store"},
//   {"name":"Qdoba", "type":"Burritos"},
//   {"name":"Dos Taquitos", "type":"Mexican"},
//   {"name":"El Dorado", "type":"Mexican"},
//   {"name":"Taco Bell", "type":"Mexican"},
//   {"name":"Salsa Fresh", "type":"Mexican"},
//   {"name":"El Rodeo", "type":"Mexican"}
//   ];

// helpers
var blackHex = 'black',
    whiteHex = 'white',
    shuffle = function(o) {
        for ( var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
            ;
        return o;
    },
    halfPI = Math.PI / 2,
    doublePI = Math.PI * 2;

String.prototype.hashCode = function(){
// See http://www.cse.yorku.ca/~oz/hash.html    
var hash = 5381,
        i;
for (i = 0; i < this.length; i++) {
  char = this.charCodeAt(i);
  hash = ((hash<<5)+hash) + char;
  hash = hash & hash; // Convert to 32bit integer
}
return hash;
};

Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};
    
// wheel object
var wheel = {
  timerHandle : 0,
  timerDelay : 33,

  angleCurrent : 0,
  angleDelta : 0,

  size : 150,

  canvasContext : null,

  colors :
  ['#d14c45',
  '#d25346',
  '#d35f47',
  '#d46849',
  '#d56e49',
  '#d77b4b',
  '#d8874d',
  '#d98c4d',
  '#d9914e',
  '#da9a4f',
  '#dba150',
  '#dca951',
  '#d14c45',
  '#d58a49',
  '#c43b33'],

  segments : [],

  seg_colors : [], // Cache of segments to colors
  
  maxSpeed : Math.PI / 16,

  upTime : 3000, // How long to spin up for (in ms)
  downTime : 10000, // How long to slow down for (in ms)

  spinStart : 0,

  frames : 0,

  centerX : 190,
  centerY : 190,

  spin : function() {
    // Start the wheel only if it's not already spinning
    if (wheel.timerHandle == 0) {
      wheel.spinStart = new Date().getTime();
      wheel.maxSpeed = Math.PI / (16 + Math.random()); // Randomly vary how hard the spin is
      wheel.frames = 0;
      // wheel.sound.play();

      wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
    }
  },

  onTimerTick : function() {
    var duration = (new Date().getTime() - wheel.spinStart),
        progress = 0,
        finished = false;

    wheel.frames++;
    wheel.draw();

    if (duration < wheel.upTime) {
      progress = duration / wheel.upTime;
      wheel.angleDelta = wheel.maxSpeed
          * Math.sin(progress * halfPI);
    } else {
      progress = duration / wheel.downTime;
      wheel.angleDelta = wheel.maxSpeed
          * Math.sin(progress * halfPI + halfPI);
              if (progress >= 1){
                  finished = true;
              }
    }

    wheel.angleCurrent += wheel.angleDelta;
          while (wheel.angleCurrent >= doublePI){
      // Keep the angle in a reasonable range
      wheel.angleCurrent -= doublePI;
          }
    if (finished) {
      clearInterval(wheel.timerHandle);
      wheel.timerHandle = 0;
      wheel.angleDelta = 0;

              if (console){ console.log((wheel.frames / duration * 1000) + " FPS"); }
    }

    /*
    // Display RPM
    var rpm = (wheel.angleDelta * (1000 / wheel.timerDelay) * 60) / (Math.PI * 2);
    $("#counter").html( Math.round(rpm) + " RPM" );
     */
  },

  init : function(optionList) {
    try {
      wheel.initWheel();
      // wheel.initAudio();
      wheel.initCanvas();
      wheel.draw();

      $.extend(wheel, optionList);

    } catch (exceptionData) {
      alert('Wheel is not loaded ' + exceptionData);
    }

  },

  // initAudio : function() {
  //   var sound = document.createElement('audio');
  //   sound.setAttribute('src', 'wheel.mp3');
  //   wheel.sound = sound;
  // },

  initCanvas : function() {
    var canvas = $('#canvas')[0];
    canvas.addEventListener("click", wheel.spin, false);
    wheel.canvasContext = canvas.getContext("2d");
  },

  initWheel : function() {
    shuffle(wheel.colors);
  },

  // Called when segments have changed
  update : function() {
    // Ensure we start mid way on a item
    //var r = Math.floor(Math.random() * wheel.segments.length);
    var r = 0,
        segments = wheel.segments,
        len = segments.length,
        colors = wheel.colors,
        colorLen = colors.length,
        seg_color = [], // Generate a color cache (so we have consistant coloring)
              i
          wheel.angleCurrent = ((r + 0.5) / wheel.segments.length) * doublePI;
          
          for (i = 0; i < len; i++){
      seg_color.push( colors [ segments[i].hashCode().mod(colorLen) ] );
          }
    wheel.seg_color = seg_color;

    wheel.draw();
  },

  draw : function() {
    wheel.clear();
    wheel.drawWheel();
    wheel.drawNeedle();
  },

  clear : function() {
    wheel.canvasContext.clearRect(0, 0, 1000, 800);
  },

  drawNeedle : function() {
    var ctx = wheel.canvasContext,
              centerX = wheel.centerX,
              centerY = wheel.centerY,
              size = wheel.size,
              i,
              centerSize = centerX + size,
              len = wheel.segments.length;

    ctx.lineWidth = 2;
    ctx.strokeStyle = blackHex;
    ctx.fillStyle = whiteHex;

    ctx.beginPath();

    ctx.moveTo(centerSize - 10, centerY);
    ctx.lineTo(centerSize + 10, centerY - 10);
    ctx.lineTo(centerSize + 10, centerY + 10);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();

    // Which segment is being pointed to?
    i = len - Math.floor((wheel.angleCurrent / doublePI) * len) - 1;

    // Now draw the winning name
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = blackHex;
    ctx.font = "2em Lato";
    if(wheel.segments[i]) {
      winner = {
        username: wheel.segments[i]
      };
      if(afterFirstSpin) {
        $('#winner').html('The winner is ' + winner.username + '!');
      } else {
        $('#winner').html('');
      }
      afterFirstSpin = true;
      winnerReset = true;  
    } else {
      winner = {
        username: null
      };
      $('#winner').html('');
    }
    // ctx.fillText(winner, centerSize + 20, centerY);
  },

  drawSegment : function(key, lastAngle, angle) {
    var ctx = wheel.canvasContext,
              centerX = wheel.centerX,
              centerY = wheel.centerY,
              size = wheel.size,
              colors = wheel.seg_color,
              value = wheel.segments[key];
    
    //ctx.save();
    ctx.beginPath();

    // Start in the centre
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, size, lastAngle, angle, false); // Draw an arc around the edge
    ctx.lineTo(centerX, centerY); // Now draw a line back to the centre

    // Clip anything that follows to this area
    //ctx.clip(); // It would be best to clip, but we can double performance without it
    ctx.closePath();

    ctx.fillStyle = colors[key];
    ctx.fill();
    ctx.stroke();

    // Now draw the text
    ctx.save(); // The save ensures this works on Android devices
    ctx.translate(centerX, centerY);
    ctx.rotate((lastAngle + angle) / 2);

    ctx.fillStyle = whiteHex;
    ctx.fillText(value.substr(0, 20), size-15, 0);
    ctx.restore();
  },

  drawWheel : function() {
    var ctx = wheel.canvasContext,
              angleCurrent = wheel.angleCurrent,
              lastAngle    = angleCurrent,
              len       = wheel.segments.length,
              centerX = wheel.centerX,
              centerY = wheel.centerY,
              size    = wheel.size,
              angle,
              i;

    ctx.lineWidth    = 1;
    ctx.strokeStyle  = blackHex;
    ctx.textBaseline = "middle";
    ctx.textAlign    = "right";
    ctx.font         = "1em Lato";

    for (i = 1; i <= len; i++) {
      angle = doublePI * (i / len) + angleCurrent;
      wheel.drawSegment(i - 1, lastAngle, angle);
      lastAngle = angle;
    }
          
    // Draw a center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, doublePI, false);
    ctx.closePath();

    ctx.fillStyle   = whiteHex;
    //ctx.strokeStyle = blackHex;
    ctx.fill();
    ctx.stroke();

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, size, 0, doublePI, false);
    ctx.closePath();

    ctx.lineWidth   = 2;
    // ctx.strokeStyle = blackHex;
    ctx.stroke();
  }
};

function createWheel() {
$('#venues').html('');

var giveawayIds = $('.numberOfPlayer').map( function() {
  return $(this).attr('giveawayId');
}).get();
  
giveawayIds.forEach(function(element) {
  var url = '/admin/playerListData/' + element;

  $.ajax({
    url: url,
    method: 'GET',
    success: function(playerList) {
      var playerList = playerList;
      if(playerList.length === 0) {
        $('#wheel').hide();
        $('#filterToggle').hide();
      }
      venues = [];
      
      playerList.forEach(function(val) {
        venues.push({
          name: val.username,
          type: val.auth,
          id: val.id,
          ip: val.ip
        })
      });

      var $venues = $('#venues'),
            $venueName = $('#name'),
            $venueType = $('#types'),
            venueTypes = [],
            $list = $('<ul/>'),
            $types = $('<ul/>'),
            $filterToggler = $('#filterToggle'),
            arrayUnique = function(a) {
                return a.reduce(function(p, c) {
                    if (p.indexOf(c) < 0) { p.push(c); }
                    return p;
                }, []);
            };

      $.each(venues, function(index, venue) {
      $list.append(
            $("<li/>")
            .append(
                  $("<input />").attr({
                         id:    'venue-' + index
                        ,name:  venue.name
                        ,value: venue.name
                        ,type:  'checkbox'
                        ,checked:true
                  })
                  .change( function() {
                    var cbox = this,
                            segments = wheel.segments,
                            i = segments.indexOf(cbox.value);

                    if (cbox.checked && i === -1) {
                      segments.push(cbox.value);
                    } else if ( !cbox.checked && i !== -1 ) {
                      segments.splice(i, 1);
                    }

                    segments.sort();
                    wheel.update();
                  })

            ).append(
                  $('<label />').attr({
                      'for':  'venue-' + index
                  })
                  .text( venue.name )
            )
        );
            venueTypes.push(venue.type);
      });
      $.each(arrayUnique(venueTypes), function (index, venue){
          $types.append(
          $("<li/>")
          .append(
                $("<input />").attr({
                       id:    'venue-type-' + index
                      ,name:  venue
                      ,value: venue
                      ,type:  'checkbox'
                      ,checked:true
                })
                .change( function() {
                      var $this = $(this), i;
                      for(i=0; i<venues.length;i++){
                          if (venues[i].type === $this.val()){
                              $('[name="'+venues[i].name+'"]').prop("checked",$this.prop('checked')).trigger('change');
                          }
                      }
                })

          ).append(
                $('<label />').attr({
                    'for':  'venue-' + index
                })
                .text( venue )
          )
      )
      });
        
      $venueName.append($list);
      $venueType.append($types);
      // Uses the tinysort plugin, but our array is sorted for now.
    //$list.find('>li').tsort("input", {attr: "value"});
      
      wheel.init(); 

      $.each($venueName.find('ul input:checked'), function(key, cbox) {
      wheel.segments.push( cbox.value );
      });

      wheel.update();
      $venues.slideUp().data("open",false);
      $filterToggler.on("click", function (){
          if($venues.data("open")){
              $venues.slideUp().data("open",false);
              $filterToggler.removeClass("open");
          }else{
              $venues.slideDown().data("open",true);
              $filterToggler.addClass("open");
          }
      });
      
      $('.checkAll').on("click", function (){
          $(this).parent().next('div').find('input').prop('checked',$(this).prop('checked')).trigger("change");
      });
    }
  });

});

};

createWheel();

setInterval(createWheel, 10000);


});