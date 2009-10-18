/*
*	timer.js
*/

$debug("Initializing Window Timer.");

//private
var $timers = $env.timers = $env.timers || [];
var $event_loop_running = false;
var $lock_timers = function(fn){
  $env.sync.call($timers,fn)();
};

var $timer = function(fn, interval){
  this.fn = fn;
  this.interval = interval;
  this.at = Date.now() + interval;
};
  
$timer.prototype.start = function(){};
$timer.prototype.stop = function(){};

var convert_time = function(time) {
  time = time*1;
  if ( isNaN(time) || time < 0 ) {
    time = 0;
  }
  if ( $event_loop_running && time < 4 ) {
    time = 4;
  }
  return time;
}

window.setTimeout = function(fn, time){
  var num;
  time = convert_time(time);
  $lock_timers(function(){
    num = $timers.length+1;
    var tfn;
    if (typeof fn == 'string') {
      tfn = function() {
        try {
          eval(fn);
        } catch (e) {
          $env.error(e);
        }
        window.clearInterval(num);          
      };
    } else {
      tfn = function() {
        try {
          fn();
        } catch (e) {
          $env.error(e);
        }
        window.clearInterval(num);
      }
    }
    $debug("Creating timer number "+num);
    $timers[num] = new $timer(tfn, time);
    $timers[num].start();
  });
  return num;
};

window.setInterval = function(fn, time){
  time = convert_time(time);
  if ( time < 10 ) {
    time = 10;
  }
  if (typeof fn == 'string') {
    var fnstr = fn; 
    fn = function() { 
      eval(fnstr);
    }; 
  }
  var num;
  $lock_timers(function(){
    num = $timers.length+1;
    //$debug("Creating timer number "+num);
    $timers[num] = new $timer(fn, time);
    $timers[num].start();
  });
  return num;
};

window.clearInterval = window.clearTimeout = function(num){
  //$log("clearing interval "+num);
  $lock_timers(function(){
    if ( $timers[num] ) {
      $timers[num].stop();
      delete $timers[num];
    }
  });
};	

// wait === null: execute any immediately runnable timers and return
// wait(n) (n > 0): execute any timers as they fire but no longer than n ms
// wait(0): execute any timers as they fire, waiting until there are none left

// FIX: make a priority queue ...

window.$wait = $env.wait = $env.wait || function(wait) {
  $event_loop_running = true; 
  if (wait !== 0 && wait !== null && wait !== undefined){
    wait += Date.now();
  }
  for (;;) {
    var earliest;
    $lock_timers(function(){
      earliest = undefined;
      for(var i in $timers){
        if( !$timers.hasOwnProperty(i) ) {
          continue;
        }
        var timer = $timers[i];
        if(!earliest || timer.at < earliest.at) {
          earliest = timer;
        }
      }
    });
    var sleep = earliest && earliest.at - Date.now();
    if ( earliest && sleep <= 0 ) {
      var f = earliest.fn;
      f();
      var goal = earliest.at + earliest.interval;
      var now = Date.now();
      if ( goal < now ) {
        earliest.at = now;
      } else {
        earliest.at = goal;
      }
      continue;
    }
    if ( !earliest || ( wait !== 0 ) && ( !wait || ( Date.now() + sleep > wait ) ) ) {
      break;
    }
    if (sleep) {
      $env.sleep(sleep);
    }
  }
  $event_loop_running = false;
};

