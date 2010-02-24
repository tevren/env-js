/*
* event.js
*/
// Window Events
//$debug("Initializing Window Event.");
var $events = [{}],
    $onerror,
    $onload,
    $onunload;

function __addEventListener__(target, type, fn){

    //$debug("adding event listener \n\t" + type +" \n\tfor "+target+" with callback \n\t"+fn);
    if ( !target.uuid ) {
        target.uuid = $events.length;
        $events[target.uuid] = {};
    }
    if ( !$events[target.uuid][type] ){
        $events[target.uuid][type] = [];
    }
    if ( $events[target.uuid][type].indexOf( fn ) < 0 ){
        $events[target.uuid][type].push( fn );
    }
};


$w.addEventListener = function(type, fn){
    __addEventListener__(this, type, fn);
};


function __removeEventListener__(target, type, fn){
  if ( !target.uuid ) {
    target.uuid = $events.length;
    $events[target.uuid] = {};
  }
  if ( !$events[target.uuid][type] ){
		$events[target.uuid][type] = [];
	}	
  $events[target.uuid][type] =
    $events[target.uuid][type].filter(function(f){
			return f != fn;
		});
};

$w.removeEventListener = function(type, fn){
    __removeEventListener__(this, type, fn)
};



function __dispatchEvent__(target, event, bubbles){
try{
    //$debug("dispatching event " + event.type);

    //the window scope defines the $event object, for IE(^^^) compatibility;
    $event = event;

    if (bubbles == undefined || bubbles == null)
        bubbles = true;

    if (!event.target) {
        //$debug("no event target : "+event.target);
        event.target = target;
    }
    //$debug("event target: " + event.target);
    if ( event.type && (target.nodeType             ||
                        target.window === window    || // compares outer objects under TM (inner == outer, but !== (currently)
                        target === window           ||
                        target.__proto__ === window ||
                        target.$thisWindowsProxyObject === window)) {
        //$debug("nodeType: " + target.nodeType);
        if ( target.uuid && $events[target.uuid][event.type] ) {
            var _this = target;
            //$debug('calling event handlers '+$events[target.uuid][event.type].length);
            $events[target.uuid][event.type].forEach(function(fn){
                //$debug('calling event handler '+fn+' on target '+_this);
                fn( event );
            });
        }
    
        if (target["on" + event.type]) {
            //$debug('calling event handler on'+event.type+' on target '+target);
            target["on" + event.type](event);
        }

      // SMP FIX: cancel/stop prop
      
      // print(event.type,target);

      if ( event.type == "click" && target instanceof HTMLAnchorElement && target.href ) {
        window.location = target.href;
      }

      if ( event.type == "click" &&
           target.form &&
           ( target instanceof HTMLInputElement || target instanceof HTMLTypeValueInputs ) &&
           ( ( target.tagName === "INPUT" &&
               (target.type === "submit" ||
                target.type === "image" ) ) ||
             ( target.tagName === "BUTTON" &&
               ( !target.type ||
                 target.type === "submit" ) ) ) ) {
        target.form.clk = target;
try{
  target.form.submit();
  // __submit__(target.form);
}catch(e){print("oopse",e);print(e.stack);};
        delete target.form.clk;
      }

      // print(event.type,target.type,target.constructor+"");
      if ( event.type == "click" && target instanceof HTMLInputElement && target.type == "checkbox" ) {
        target.checked = target.checked ? "" : "checked";
      }

      if ((event.type == "submit") && target instanceof HTMLFormElement) {
        $env.unload($w);
        var proxy = $w.window;
        var data;
        var boundary;
        if (target.enctype === "multipart/form-data") {
          boundary = (new Date).getTime();
        }
        data = $master["static"].__formSerialize__(target,undefined,boundary);
        var options = {method: target.method || "get", data: data};
        if (boundary) {
          options["Content-Type"] = "multipart/form-data; boundary="+boundary;
        } else {
          options["Content-Type"] = 'application/x-www-form-urlencoded';
        }
        var action = target.action || window.location.href;
        $env.reload(proxy, action, options );
      }

    }else{
        //$debug("non target: " + event.target + " \n this->"+target);
    }
    if (bubbles && target.parentNode){
        //$debug('bubbling to parentNode '+target.parentNode);
        __dispatchEvent__(target.parentNode, event, bubbles);
    }
}catch(e){
print("oops",e);
print(e.stack);
}
};
	
$env.__removeEventListener__ = __removeEventListener__;
$env.__addEventListener__ = __addEventListener__;
$env.__dispatchEvent__ = __dispatchEvent__;

$w.dispatchEvent = function(event, bubbles){
    __dispatchEvent__(this, event, bubbles);
};

$w.__defineGetter__('onerror', function(){
  return function(){
   //$w.dispatchEvent('error');
  };
});

$w.__defineSetter__('onerror', function(fn){
  //$w.addEventListener('error', fn);
});

/*$w.__defineGetter__('onload', function(){
  return function(){
		//var event = document.createEvent();
		//event.initEvent("load");
   //$w.dispatchEvent(event);
  };
});

$w.__defineSetter__('onload', function(fn){
  //$w.addEventListener('load', fn);
});

$w.__defineGetter__('onunload', function(){
  return function(){
   //$w.dispatchEvent('unload');
  };
});

$w.__defineSetter__('onunload', function(fn){
  //$w.addEventListener('unload', fn);
});*/