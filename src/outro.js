// faux-intro ...
// (function(){
//   (function(){
//     function(){

      $w.__loadAWindowsDocument__(options.url || "about:blank");
    };

    return $env;

  })(); // close function definition begun in 'intro.js'

  // Initial window setup
  $env.init.call(this);

  // User accesible interface ...
  Envjs = $env.Envjs = function(){
    if(arguments.length === 2){
      for ( var i in arguments[1] ) {
    	var g = arguments[1].__lookupGetter__(i), 
            s = arguments[1].__lookupSetter__(i);
    	if ( g || s ) {
    	  if ( g ) $env.__defineGetter__(i, g);
    	  if ( s ) $env.__defineSetter__(i, s);
    	} else
    	  $env[i] = arguments[1][i];
      }
    }
    if (arguments[0] != null && arguments[0] != "")
      window.location = arguments[0];
  };
  Envjs.$env = $env;
  Envjs.wait = $env.wait;
  Envjs.interpreter = window.whichInterpreter;
  Envjs.evaluate = $env.$master.evaluate;
  
})();

// Local Variables:
// mode:auto-revert
// End:
