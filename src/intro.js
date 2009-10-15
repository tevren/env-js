print("SMPI",this);

try {

(function(){
    var windowfn = function($w,
                            $parentWindow,
                            $openingWindow,
                            $initTop,
                            $thisIsTheOriginalWindow){

this.window = this;
print("SMP0",this);
print("SMP0",$w);
print("SMP0",window);
if(this!=$w){
  print(this);
  print($w);
  Ruby.raise("Hell");
}

  var $env = Envjs = function(){
    if(arguments.length === 2){
        for ( var i in arguments[1] ) {
    		var g = arguments[1].__lookupGetter__(i), 
                s = arguments[1].__lookupSetter__(i);
    		if ( g || s ) {
    			if ( g ) Envjs.__defineGetter__(i, g);
    			if ( s ) Envjs.__defineSetter__(i, s);
    		} else
    			Envjs[i] = arguments[1][i];
    	}
    }

    if (arguments[0] != null && arguments[0] != "")
        window.location = arguments[0];
};

      if ( false ) {
      try { Ruby.raise("qqq"); } catch (e) { print("QQQ",e.stack) };
      print("SMP new window t",this);
      print("SMP new window w",$w);
      print("SMP new window pw",$parentWindow);
      print("SMP new window ow",$openingWindow);
      }

        // The Window Object
        var __this__ = $w;
        $w.__defineGetter__('window', function(){
            return __this__;
        });
        $w.$isOriginalWindow = $thisIsTheOriginalWindow;
        $w.$haveCalledWindowLocationSetter = false;

