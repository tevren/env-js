/**
 * @author thatcher
 */
(function(window,document){

var Html5Parser;

var psettimeout;

var sync = function(parser){
  parser.ptimeouts = [];
  parser.pschedule = function($schedule,timer,t) {
    var old = psettimeout; 
    psettimeout = function(fn){
      parser.ptimeouts.push(fn);
    };
    $schedule(timer,t);
    psettimeout = old;
  };
  parser.pwait = function() {
    var fn;
    while(fn = parser.ptimeouts.pop()){
      fn();
    };
  };
};

var async = function(parser){
  delete parser.ptimeouts;
  parser.pschedule = function($schedule,timer,t) {
    var old = psettimeout; 
    psettimeout = window.setTimeout;
    $schedule(timer,t);
    psettimeout = old;
  };
  parser.pwait = function(){$env.wait(-1);};
};