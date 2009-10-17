/*
*	timer.js
*/

$debug("Initializing Window Timer.");

//private
var $timers = $env.timers = $env.timers || [];
var $lock_timers = function(fn){
  $env.sync.call($timers,fn)();
};

var $timer = function(fn, interval){
  if ( (typeof interval) != "number" ) {
    throw "bad argument to timer";
  }
  this.fn = fn;
  this.interval = interval;
  this.at = Date.now() + interval;
};
  
$timer.prototype.start = function(){};
$timer.prototype.stop = function(){};

window.setTimeout = function(fn, time){
  var num;
  $lock_timers(function(){
    num = $timers.length+1;
    var tfn;
    if (typeof fn == 'string') {
      tfn = function() {
        eval(fn);
        window.clearInterval(num);
      };
    } else {
      tfn = function() {
        fn();
        window.clearInterval(num);
      }
    }
    $debug("Creating timer number "+num);
    $timers[num] = new $timer(tfn, time);
    $timers[num].start();
  });
  return num;
};

window.$wait = function(wait){ $env.wait(wait); }

window.setInterval = function(fn, time){
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
      earliest.at = Date.now() + earliest.interval;
      continue;
    }
    if ( !earliest || ( wait !== 0 ) && ( !wait || ( Date.now() + sleep > wait ) ) ) {
      break;
    }
    if (sleep) {
      java.lang.Thread.currentThread().sleep(sleep);
    }
  }
};
