
/**
 * @author thatcher
 */
var Envjs = function(){
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

/*
*	core.js
*/
(function($env){
    
    //You can emulate different user agents by overriding these after loading env
    $env.appCodeName  = "Envjs";//eg "Mozilla"
    $env.appName      = "Resig/20070309 BirdDog/0.0.0.1";//eg "Gecko/20070309 Firefox/2.0.0.3"

    //set this to true and see profile/profile.js to select which methods
    //to profile
    $env.profile = false;
    
    $env.log = $env.log || function(msg, level){};
	
    $env.DEBUG  = 4;
    $env.INFO   = 3;
    $env.WARN   = 2;
    $env.ERROR  = 1;
	$env.NONE   = 0;
	
    //set this if you want to get some internal log statements
    $env.logLevel = $env.DEBUG;
    $env.logLevel = $env.INFO;
    $env.logLevel = $env.WARN;
    
    $env.debug  = function(msg){
		if($env.logLevel >= $env.DEBUG)
            $env.log(msg,"DEBUG"); 
    };
    $env.info = function(msg){
        if($env.logLevel >= $env.INFO)
            $env.log(msg,"INFO"); 
    };
    $env.warn   = function(msg){
        if($env.logLevel >= $env.WARN)
            $env.log(msg,"WARNIING");    
    };
    $env.error = function(msg, e){
        if ($env.logLevel >= $env.ERROR) {
			$env.log(msg + " Line: " + $env.lineSource(e), 'ERROR');
			$env.log(e || "", 'ERROR');
		}
    };
    
    $env.debug("Initializing Core Platform Env");


    // if we're running in an environment without env.js' custom extensions
    // for manipulating the JavaScript scope chain, put in trivial emulations
    $env.debug("performing check for custom Java methods in env-js.jar");
    var countOfMissing = 0, dontCare;
    try { dontCare = getFreshScopeObj; }
    catch (ex){      getFreshScopeObj  = function(){ return {}; };
                                                       countOfMissing++; }
    try { dontCare = getProxyFor; }
    catch (ex){      getProxyFor       = function(obj){ return obj; };
                                                       countOfMissing++; }
    try { dontCare = getScope; }
    catch (ex){      getScope          = function(){}; countOfMissing++; }
    try { dontCare = setScope; }
    catch (ex){      setScope          = function(){}; countOfMissing++; }
    try { dontCare = configureScope; }
    catch (ex){      configureScope    = function(){}; countOfMissing++; }
    try { dontCare = restoreScope; }
    catch (ex){      restoreScope      = function(){}; countOfMissing++; }
    try { $env.loadIntoFnsScope = loadIntoFnsScope; }
    catch (ex){      $env.loadIntoFnsScope = load;     countOfMissing++; }
    if (countOfMissing != 0 && countOfMissing != 7)
        $env.warn("Some but not all of scope-manipulation functions were " +
                  "not present in environment.  JavaScript execution may " +
                  "not occur correctly.");

    $env.lineSource = $env.lineSource || function(e){};
    
    //resolves location relative to base or window location
    $env.location = $env.location || function(path, base){};
    
    $env.sync = $env.sync || function(fn){
      return function(){ return fn.apply(this,arguments); };
    };

    $env.spawn = $env.spawn || function(fn) {
      setTimeout(fn,0);
    };

    $env.sleep = $env.sleep || function(){};

    $env.javaEnabled = false;  

    //Used in the XMLHttpRquest implementation to run a
    // request in a seperate thread
    $env.runAsync = $env.runAsync || function(fn){};
        
    //Used to write to a local file
    $env.writeToFile = $env.writeToFile || function(text, url){};
        
    //Used to write to a local file
    $env.writeToTempFile = $env.writeToTempFile || function(text, suffix){};
    
    //Used to delete a local file
    $env.deleteFile = $env.deleteFile || function(url){};
    
    $env.connection = $env.connection || function(xhr, responseHandler, data){};
    
    $env.parseHTML = function(htmlstring){};
    $env.parseXML = function(xmlstring){};
    $env.xpath = function(expression, doc){};
    
    $env.tmpdir         = ''; 
    $env.os_name        = ''; 
    $env.os_arch        = ''; 
    $env.os_version     = ''; 
    $env.lang           = ''; 
    $env.platform       = "";
    
    $env.scriptTypes = {
        "text/javascript"   :true,
        "text/envjs"        :true
    };
    
    $env.onScriptLoadError = $env.onScriptLoadError || function(){};
    $env.loadLocalScript = function(script, parser){
        $env.debug("loading script ");
        var types, type, src, i, base, 
            docWrites = [],
            write = document.write,
            writeln = document.writeln;
        //temporarily replace document write becuase the function
        //has a different meaning during parsing
        document.write = function(text){
			docWrites.push(text);
		};
        try{
			if(script.type){
                types = script.type?script.type.split(";"):[];
                for(i=0;i<types.length;i++){
                    if($env.scriptTypes[types[i]]){
						if(script.src){
                            $env.info("loading allowed external script :" + script.src);
                            //lets you register a function to execute 
                            //before the script is loaded
                            if($env.beforeScriptLoad){
                                for(src in $env.beforeScriptLoad){
                                    if(script.src.match(src)){
                                        $env.beforeScriptLoad[src]();
                                    }
                                }
                            }
                            base = "" + window.location;
                            load($env.location(script.src.match(/([^\?#]*)/)[1], base ));
                            //lets you register a function to execute 
                            //after the script is loaded
                            if($env.afterScriptLoad){
                                for(src in $env.afterScriptLoad){
                                    if(script.src.match(src)){
                                        $env.afterScriptLoad[src]();
                                    }
                                }
                            }
                        }else{
                            $env.loadInlineScript(script);
                        }
                    }else{
                        if(!script.src && script.type == "text/javascript"){
                            $env.loadInlineScript(script);
                        }
                    }
                }
            }else{
                //anonymous type and anonymous src means inline
                if(!script.src){
                    $env.loadInlineScript(script);
                }
            }
        }catch(e){
            $env.error("Error loading script.", e);
            $env.onScriptLoadError(script);
        }finally{
            if(parser){
                parser.appendFragment(docWrites.join(''));
			}
			//return document.write to it's non-script loading form
            document.write = write;
            document.writeln = writeln;
        }
    };
        
    $env.loadInlineScript = $env.loadInlineScript || function(script){};
    
    $env.getFreshScopeObj = function(){};
    $env.getProxyFor = function(){};
    $env.getScope = function(){};
    $env.setScope = function(){};
    $env.configureScope = function(){};
    $env.restoreScope = function(){};


    $env.loadFrame = function(frameElement, url){
        try {
            if (frameElement._content){
                $env.$unloadEventsFor(frameElement._content);
                $env.reloadAWindowProxy(frameElement._content, url);
            }
            else {
              var v = $env.makeNewWindowMaybeLoad(this,
                    frameElement.ownerDocument.parentWindow, url);
              frameElement._content = v;
            }
        } catch(e){
            $env.error("failed to load frame content: from " + url, e);
        }
    };
    
    $env.reloadAWindowProxy = $env.reloadAWindowProxy || function(oldWindowProxy, url){
        var newWindowProxy = $env.makeNewWindowMaybeLoad(
                                 oldWindowProxy.opener,
                                 oldWindowProxy.parent,
                                 url);
        var newWindow = newWindowProxy.__proto__;

        oldWindowProxy.__proto__ = newWindow;
        newWindow.$thisWindowsProxyObject = oldWindowProxy;
        newWindow.document._parentWindow = oldWindowProxy;
    };

    $env.makeNewWindowMaybeLoad = $env.makeNewWindowMaybeLoad || function(openingWindow, parentArg, url){
        var newWindow = $env.getFreshScopeObj();
        var newProxy  = $env.getProxyFor(newWindow);
        newWindow.$thisWindowsProxyObject = newProxy;

        var local__window__    = $env.window,
            local_env          = $env,
            local_opener       = openingWindow,
            local_parent       = parentArg ? parentArg : newWindow;

        var inNewContext = function(){
            local__window__(newWindow,        // object to "window-ify"
                            local_env,        // our scope for globals
                            local_parent,     // win's "parent"
                            local_opener,     // win's "opener"
                            local_parent.top, // win's "top"
                            false             // this win isn't the original
                           );
            if (url)
                newWindow.__loadAWindowsDocument__(url);
        };

        var scopes = recordScopesOfKeyObjects(inNewContext);
        setScopesOfKeyObjects(inNewContext, newWindow);
        inNewContext(); // invoke local fn to window-ify new scope object
        restoreScopesOfKeyObjects(inNewContext, scopes);
        return newProxy;
    };

    function recordScopesOfKeyObjects(fnToExecInOtherContext){
        return {                //   getScope()/setScope() from Window.java
            frame :          $env.getScope(fnToExecInOtherContext),
            window :         $env.getScope($env.window),
            global_load :    $env.getScope($env.loadIntoFnsScope),
            local_load :     $env.getScope($env.loadLocalScript)
        };
    }

    function setScopesOfKeyObjects(fnToExecInOtherContext, windowObj){
        $env.setScope(fnToExecInOtherContext,  windowObj);
        $env.setScope($env.window,             windowObj);
        $env.setScope($env.loadIntoFnsScope,   windowObj);
        $env.setScope($env.loadLocalScript,    windowObj);
    }

    function restoreScopesOfKeyObjects(fnToExecInOtherContext, scopes){
        $env.setScope(fnToExecInOtherContext,  scopes.frame);
        $env.setScope($env.window,             scopes.window);
        $env.setScope($env.loadIntoFnsScope,   scopes.global_load);
        $env.setScope($env.loadLocalScript,    scopes.local_load);
    }

})($env);