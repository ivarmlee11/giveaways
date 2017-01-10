$(function() {

var url = window.location.href;

url = url.split('/');

var idx = url[url.length -1],
    winner,
    winnerReset = false,
    afterFirstSpin = false;

// $('#selectWinner').on('click', function() {
//   var url = '/admin/playerListData/' + idx;
//   $.ajax({
//     url: url,
//     type: 'GET',
//     success: function(players) {
//       var playerList = players;
//       winner = playerList[Math.floor(Math.random()*playerList.length)];
//       if(winner) {
//         winnerReset = true;
//         $('#winner').html('The winner is ' + winner.username + '!');
//       } else {
//         $('#winner').html('Nobody has entered the competition yet!');
//       } 
//     }
//   });
// });

// $('#addWinnerToDb').on('click', function() {
//   var url = '/admin/addToWinHistory/' + idx;
//   console.log(winner);
//   if(winnerReset) {
//     $.ajax({
//       url: url,
//       type: 'POST',
//       data: winner,
//       success: function(data) {
//         console.log(data);
//         winnerReset = false;
//         $('#winner').html(data);
//       }
//     });
//   } else {
//     $('#winner').html('The winner has not been drawn or nobody has entered the competition yet!');
//   }
// });

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
    
// wheel
var wheel = {
  timerHandle : 0,
  timerDelay : 33,

  angleCurrent : 0,
  angleDelta : 0,

  size : 150,

  canvasContext : null,

  colors :
  ['#336FD1',
  '#D277C6',
  '#C4CCD3',
  '#D4C70C',
  '#d56e49',
  '#3BD78E',
  '#d8874d',
  '#ECFF11',
  '#2F3BD9',
  '#550000',
  '#BEFF45',
  '#005500',
  '#d14c45',
  '#d58a49',
  '#c43b33'],

  segments : [],

  seg_colors : [], // Cache of segments to colors
  
  maxSpeed : Math.PI / 16,

  upTime : 3500, // How long to spin up for (in ms)
  downTime : Math.floor((Math.random() * 1000) + 7000), // How long to slow down for (in ms)

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
      afterFirstSpin = true;
      wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
    }
  },

  onTimerTick : function() {
    var duration = (new Date().getTime() - wheel.spinStart),
        finished,
        progress = 0;

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
      // if (console){ console.log((wheel.frames / duration * 1000) + " FPS"); }
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
      // alert('Wheel is not loaded ' + exceptionData);
    }

  },

  // initAudio : function() {
  //   var sound = document.createElement('audio');
  //   sound.setAttribute('src', 'wheel.mp3');
  //   wheel.sound = sound;
  // },

  initCanvas : function() {
    var canvas = $('#gameWheel')[0];
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
      game = {
        name: wheel.segments[i]
      };
      if(afterFirstSpin) {
        // if(finished) {
          $('#game').html('The game is ' + game.name + '!');
        // }
      } else {
        $('#game').html('');
      }
      winnerReset = true;  
    } else {
      game = {
        name: null
      };
      $('#game').html('');
    }
    var winnerString = game.name;
    ctx.fillText(winnerString, centerSize + 10, centerY);
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

  // var giveawayIds = $('.numberOfPlayer').map( function() {
  //   return $(this).attr('giveawayId');
  // }).get();
    
  // giveawayIds.forEach(function(element) {
    var url = '/admin/gameDataOnly';
    $.ajax({
      url: url,
      method: 'GET',
      success: function(gameList) {
        var gameList = gameList;

        if(gameList.length === 0) {
          $('#gameDBWheel').hide();
        } else {
          $('#gameDBWheel').show();
        }
        venues = [];
        wheel.segments = [];
        gameList.forEach(function(val) {
          venues.push({
            name: val.name,
            code: val.code,
            price: val.price,
            coderevealed: val.coderevealed,
            owned: val.owned
          })
          wheel.segments.push(val.name);
        });
        wheel.init(); 
        wheel.update();
      }
    });
  // });

};

createWheel();
$('#redrawGameWheel').on('click', function() {
  afterFirstSpin = false;
  finished = false;
  createWheel();
})
// setInterval(createWheel, 10000);


});