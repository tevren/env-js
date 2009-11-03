$env.log = function(msg, level){
    print(' '+ (level?level:'LOG') + ':\t['+ new Date()+"] {ENVJS} "+msg);
};

$env.location = function(path, base){
    // print("loc",path,base);
    if ( path == "about:blank" ) {
        return path;
    }
    var protocol = new RegExp('(^file\:|^http\:|^https\:)');
    var m = protocol.exec(path);
    if(m&&m.length>1){
        var url = Ruby.URI.parse(path);
        var s = url.toString();
        if ( s.substring(0,6) == "file:/" && s[6] != "/" ) {
            s = "file://" + s.substring(5,s.length);
        }
        // print("YY",s);
        return s;
    }else if(base){
        base = Ruby.URI.parse(base);
        if ( path[0] == "/" ) {
            base.path = path;
            base = base + "";
        } else {
            base = base + "";
            base = base.substring(0, base.lastIndexOf('/'));
            base = base + '/' + path;
        }
        var result = base;
        // ? This path only used for files?
        if ( result.substring(0,6) == "file:/" && result[6] != "/" ) {
            result = "file://" + result.substring(5,result.length);
        }
        if ( result.substring(0,7) == "file://" ) {
            result = result.substring(7,result.length);
        }
        // print("ZZ",result);
        return result;
    }else{
        //return an absolute url from a url relative to the window location
        if( ( base = ( ( $master.first_script_window && $master.first_script_window.location ) || window.location ) ) &&
            ( base != "about:blank" ) &&
            base.href &&
            (base.href.length > 0) ) {
            base = base.href.substring(0, base.href.lastIndexOf('/'));
            var result = base + '/' + path;
            if ( result.substring(0,6) == "file:/" && result[6] != "/" ) {
                result = "file://" + result.substring(5,result.length);
            }
            // print("****",result);
            return result;
        } else {
            // print("RRR",result);
            return "file://"+Ruby.File.expand_path(path);
        }
    }
};

$env.connection = function(xhr, responseHandler, data){
    var url = Ruby.URI.parse(xhr.url);
    var connection;
    var resp;
    // print("xhr",xhr.url);
    // print("xhr",url);
    if ( /^file\:/.test(url) ) {
        try{
            if ( xhr.method == "PUT" ) {
                var text =  data || "" ;
                $env.writeToFile(text, url);
            } else if ( xhr.method == "DELETE" ) {
                $env.deleteFile(url);
            } else {
                Ruby.require('envjs/net/file');
                var request = new Ruby.Envjs.Net.File.Get( url.path );
                connection = Ruby.Envjs.Net.File.start( url.host, url.port );
                resp = connection.request( request );
                //try to add some canned headers that make sense
                
                try{
                    if(xhr.url.match(/html$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/html';
                    }else if(xhr.url.match(/.xml$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/xml';
                    }else if(xhr.url.match(/.js$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/javascript';
                    }else if(xhr.url.match(/.json$/)){
                        xhr.responseHeaders["Content-Type"] = 'application/json';
                    }else{
                        xhr.responseHeaders["Content-Type"] = 'text/plain';
                    }
                    //xhr.responseHeaders['Last-Modified'] = connection.getLastModified();
                    //xhr.responseHeaders['Content-Length'] = headerValue+'';
                    //xhr.responseHeaders['Date'] = new Date()+'';*/
                }catch(e){
                    $env.error('failed to load response headers',e);
                }
                
            }
        } catch (e) {
            connection = null;
            xhr.readyState = 4;
            if(e.toString().match(/Errno::ENOENT/)) {
                xhr.status = "404";
                xhr.statusText = "Not Found";
                xhr.responseText = undefined;
            } else {
                xhr.status = "500";
                xhr.statusText = "Local File Protocol Error";
                xhr.responseText = "<html><head/><body><p>"+ e+ "</p></body></html>";
            }
        }
    } else { 
        Ruby.require('net/http');

        var req;
        var path;
        try {
            path = url.request_uri();
        } catch(e) {
            path = url.path;
        }
        if ( xhr.method == "GET" ) {
            req = new Ruby.Net.HTTP.Get( path );
        } else if ( xhr.method == "POST" ) {
            req = new Ruby.Net.HTTP.Post( path );
        } else if ( xhr.method == "PUT" ) {
            req = new Ruby.Net.HTTP.Put( path );
        }

        for (var header in xhr.headers){
            $master.add_req_field( req, header, xhr.headers[header] );
        }
	
	//write data to output stream if required
        if(data&&data.length&&data.length>0){
	    if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                req.body = data;
            }
	}
	
        connection = Ruby.Net.HTTP.start( url.host, url.port );

        resp = connection.request(req);
    }
    if(connection){
        try{
            if (false) {
            var respheadlength = connection.getHeaderFields().size();
            // Stick the response headers into responseHeaders
            for (var i = 0; i < respheadlength; i++) { 
                var headerName = connection.getHeaderFieldKey(i); 
                var headerValue = connection.getHeaderField(i); 
                if (headerName)
                    xhr.responseHeaders[headerName+''] = headerValue+'';
            }
            }
            resp.each(function(k,v){
                xhr.responseHeaders[k] = v;
            });
        }catch(e){
            $env.error('failed to load response headers',e);
        }
        
        xhr.readyState = 4;
        xhr.status = parseInt(connection.responseCode,10) || undefined;
        xhr.statusText = connection.responseMessage || "";
        
        var contentEncoding = resp["Content-Encoding"] || "utf-8",
        baos = new Ruby.StringIO,
        length,
        stream = null,
        responseXML = null;

        try{
            var lower = contentEncoding.toLowerCase();
            stream = ( lower == "gzip" || lower == "decompress" ) ?
                ( Ruby.raise("java") && new java.util.zip.GZIPInputStream(resp.getInputStream()) ) : resp;
        }catch(e){
            if (resp.code == "404")
                $env.info('failed to open connection stream \n' +
                          e.toString(), e);
            else
                $env.error('failed to open connection stream \n' +
                           e.toString(), e);
            stream = resp;
        }
        
        baos.write(resp.body);

        baos.close();
        connection.finish();

        xhr.responseText = baos.string();
    }
    if(responseHandler){
        $env.debug('calling ajax response handler');
        responseHandler();
    }
};

var extract_line =
    Ruby.eval(
"lambda { |e| \
  begin; \
    e.stack.to_s.split(%(\n))[1].match(/:([^:]*)$/)[1]; \
  rescue; %(unknown); end; \
}");

var print_exception = window.print_exception =
    Ruby.eval(" \
lambda { |e| \
  estr = e.to_s; \
  estr.gsub!(/(<br \\/>)+/, %( )); \
  print(%(Exception: ),estr,%(\n)); \
  begin; \
  e.stack.to_s.split(%(\n)).each do |line| \
    m = line.match(/(.*)@([^@]*)$/); \
    m[2] == %(:0) && next; \
    s = m[1]; \
    s.gsub!(/(<br \\/>)+/, %( )); \
    limit = 100; \
    if ( s.length > limit ); \
      s = s[0,limit] + %(...); \
    end; \
    print(m[2],%( ),s,%(\n)); \
  end; \
  rescue; end; \
} \
");

$env.lineSource = function(e){
    if(e){
        print_exception.call(e);
        return extract_line.call(e);
    } else {
        return "";
    }
};
    
$env.loadInlineScript = function(script){
    var original_script_window = $master.first_script_window;
    if ( !$master.first_script_window ) {
        $master.first_script_window = window;
    }
    try {
        $master.evaluate(script.text,$w);
    } catch(e) {
        $env.error("error evaluating script: "+script.text);
        $env.error(e);
    }
    $master.first_script_window = original_script_window;
};
    
$env.writeToTempFile = function(text, suffix){
    $env.debug("writing text to temp url : " + suffix);
    // print(text);
    // Create temp file.
    Ruby.require('envjs/tempfile');
    var temp = new Ruby.Envjs.TempFile( "envjs-tmp", suffix );
    
    // Write to temp file
    temp.write(text);
    temp.close();
    return temp.getAbsolutePath().toString()+'';
};
    
$env.writeToFile = function(text, url){
    // print("writing text to url : " + url);
    $env.debug("writing text to url : " + url);
    if ( url.substring(0,7) == "file://" ) {
        url = url.substring(7,url.length);
    }
    var file = Ruby.open( url, "w" );
    // Write to temp file
    file.write(text);
    file.close();
};
    
$env.deleteFile = function(url){
    Ruby.File.unlink(url);
};

$env.__eval__ = function(script,scope){
    if (script == "")
        return;
    try {
        var scopes = [];
        var original = script;
        if(scope) {
            script = "(function(){return eval(original)}).call(scopes[0])";
            while(scope) {
                scopes.push(scope);
                scope = scope.parentNode;
                script = "with(scopes["+(scopes.length-1)+"] ){"+script+"};"
            }
        }
        script = "function(original,scopes){"+script+"}"
        var original_script_window = $master.first_script_window;
        if ( !$master.first_script_window ) {
            $master.first_script_window = window;
        }
        var result = $master.evaluate(script,$w)(original,scopes);
        $master.first_script_window = original_script_window;
        return result;
    }catch(e){
        $error(e);
    }
};

$env.makeNewWindowMaybeLoad = function(openingWindow, parentArg, url, outer){
// print(location);
// print("url",url,window.location,openingWindow);
// print("parent",parentArg);
    var options = {
        opener: openingWindow,
        parent: parentArg,
        url: $env.location(url)
    };

    var pair = $env.new_window(outer);
    var proxy = pair[0];
    var new_window = pair[1];
    options.proxy = proxy;
    new_window.$options = options;
    $master.load(Ruby.Envjs.ENVJS, new_window);
    return proxy;
};

$env.reloadAWindowProxy = function(oldWindowProxy, url){
    // print("reload",window,oldWindowProxy,url);
    $env.makeNewWindowMaybeLoad( oldWindowProxy.opener,
                                 oldWindowProxy.parent,
                                 url,
                                 oldWindowProxy );
};

$env.sleep = function(n){Ruby.sleep(n/1000.);};

$env.loadIntoFnsScope = function(file) {
    return load(file);
}

$env.runAsync = function(fn){
    $env.debug("running async");
        
    var run = $env.sync( function(){ fn(); } );
        
    try{
        $env.spawn(run);
    }catch(e){
        $env.error("error while running async", e);
    }
};
    
// Local Variables:
// espresso-indent-level:4
// c-basic-offset:4
// End:
