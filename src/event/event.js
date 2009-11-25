$debug("Defining Event");
/*
* event.js
*/
var Event = function(options){
      options={};
  __extend__(this,{
    CAPTURING_PHASE : 1,
    AT_TARGET       : 2,
    BUBBLING_PHASE  : 3
  });
  $debug("Creating new Event");
  var $bubbles = options.bubbles?options.bubbles:true,
      $cancelable = options.cancelable?options.cancelable:true,
      $currentTarget = options.currentTarget?options.currentTarget:null,
      $eventPhase = options.eventPhase?options.eventPhase:Event.CAPTURING_PHASE,
      $target = options.target?options.target:null,
      $timestamp = options.timestamp?options.timestamp:new Date().getTime().toString(),
      $type = options.type?options.type:"";
  return __extend__(this,{
    get bubbles(){return $bubbles;},
    get cancelable(){return $cancelable;},
    get currentTarget(){return $currentTarget;},
    get eventPhase(){return $eventPhase;},
    get target(){return $target;},
    set target(target){ $target = target;},
    get timestamp(){return $timestamp;},
    get type(){return $type;},
    initEvent: function(type,bubbles,cancelable){
      $type=type?type:$type;
      $bubbles=bubbles?bubbles:$bubbles;
      $cancelable=cancelable?cancelable:$cancelable;
    },
    preventDefault: function(){return;/* TODO */},
    stopPropagation: function(){return;/* TODO */}
  });
};

$w.Event = Event;
