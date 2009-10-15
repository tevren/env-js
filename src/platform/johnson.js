/*
*	env.johnson.js
*/

(function($env){
    
    whichInterpreter = "Johnson";
    multiwindow = true;

    $env.log = function(msg, level){
         print(' '+ (level?level:'LOG') + ':\t['+ new Date()+"] {ENVJS} "+msg);
    };
    
    var extract_line =
        Ruby.eval(
"lambda { |e| \
  e.to_s.split(%(\n))[1].match(/:([^:]*)$/)[1]; \
}")

    $env.lineSource = function(e){
        return extract_line.call(e.stack);
    };
    
    $env.location = function(path, base){
      var protocol = new RegExp('(^file\:|^http\:|^https\:)');
        var m = protocol.exec(path);
        if(m&&m.length>1){
            return Ruby.URI.parse(path).to_s();
        }else if(base){
          Ruby.raise("java");
          return new java.net.URL(new java.net.URL(base), path).toString()+'';
        }else{
            //return an absolute url from a url relative to the window location
            if(window.location.href.length > 0){
                base = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
                return base + '/' + path;
            }else{
                return "file:"+Ruby.File.expand_path(path);
            }
        }
    };
    
    var timers = [];

    //For Java the window.timer is created using the java.lang.Thread in combination
    //with the java.lang.Runnable
    $env.timer = function(fn, time){
       var running = true;
        
        var run = sync(function(){ //while happening only thing in this timer    
    	    //$env.debug("running timed function");
            fn();
        });
        var _this = this;
        Ruby.raise("java");
        var thread = new java.lang.Thread(new java.lang.Runnable({
            run: function(){
                try {
                    while (running){
                        Ruby.raise("java");
                        java.lang.Thread.currentThread().sleep(time);
                        run.apply(_this);
                    }
                }catch(e){
                    $env.debug("interuption running timed function");
                    _this.stop();
                    $env.onInterrupt();
                };
            }
        }));
        this.start = function(){ 
            thread.start(); 
        };
        this.stop = sync(function(num){
            running = false;
            thread.interrupt();
        })
    };
    
    //Since we're running in rhino I guess we can safely assume
    //java is 'enabled'.  I'm sure this requires more thought
    //than I've given it here
    $env.javaEnabled = true;	
    
    
    //Used in the XMLHttpRquest implementation to run a
    // request in a seperate thread
    $env.onInterrupt = function(){};
    $env.runAsync = function(fn){
        $env.debug("running async");
        var running = true;
        
        var run = sync(function(){ //while happening only thing in this timer    
    	    //$env.debug("running timed function");
            fn();
        });
        
        Ruby.raise("java");
        var async = (new java.lang.Thread(new java.lang.Runnable({
            run: run
        })));
        
        try{
            async.start();
        }catch(e){
            $env.error("error while running async", e);
            async.interrupt();
            $env.onInterrupt();
        }
    };
    
    //Used to write to a local file
    $env.writeToFile = function(text, url){
        $env.debug("writing text to url : " + url);
        Ruby.raise("java");
        var out = new java.io.FileWriter( 
            new java.io.File( 
                new java.net.URI(url.toString())));	
        out.write( text, 0, text.length );
        out.flush();
        out.close();
    };
    
    //Used to write to a local file
    $env.writeToTempFile = function(text, suffix){
        $env.debug("writing text to temp url : " + suffix);
        // Create temp file.
        Ruby.require('envjs/tempfile');
        var temp = new Ruby.Envjs.TempFile( "envjs-tmp", suffix );
    
        // Write to temp file
        temp.write(text);
        temp.close();
        return temp.getAbsolutePath().toString()+'';
    };
    
    //Used to delete a local file
    $env.deleteFile = function(url){
        Ruby.raise("java");
        var file = new java.io.File( new java.net.URI( url ) );
        file["delete"]();
    };
    
    $env.connection = function(xhr, responseHandler, data){
      var url = Ruby.URI.parse(xhr.url);
      var connection;
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
                    var file = Ruby.Envjs.Net.File.start( url.host, url.port );
                    connection = file.request( request );
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
            }catch(e){
                $env.error('failed to open file '+ url, e);
                throw(e);
                connection = null;
                xhr.readyState = 4;
                xhr.statusText = "Local File Protocol Error";
                xhr.responseText = "<html><head/><body><p>"+ e+ "</p></body></html>";
            }
        } else { 
            connection = url.openConnection();
            connection.setRequestMethod( xhr.method );
			
            // Add headers to Java connection
            for (var header in xhr.headers){
                connection.addRequestProperty(header+'', xhr.headers[header]+'');
            }
			
			//write data to output stream if required
            if(data&&data.length&&data.length>0){
				 if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                	                connection.setDoOutput(true);
                                        Ruby.raise("java");
					var outstream = connection.getOutputStream(),
						outbuffer = new java.lang.String(data).getBytes('UTF-8');
					
                    outstream.write(outbuffer, 0, outbuffer.length);
					outstream.close();
            	}
			}else{
		  		connection.connect();
			}
			
            
        }
        if(connection){
            try{
                var respheadlength = connection.getHeaderFields().size();
                // Stick the response headers into responseHeaders
                for (var i = 0; i < respheadlength; i++) { 
                    var headerName = connection.getHeaderFieldKey(i); 
                    var headerValue = connection.getHeaderField(i); 
                    if (headerName)
                        xhr.responseHeaders[headerName+''] = headerValue+'';
                }
            }catch(e){
                $env.error('failed to load response headers',e);
            }
            
            xhr.readyState = 4;
            xhr.status = parseInt(connection.responseCode,10) || undefined;
            xhr.statusText = connection.responseMessage || "";
            
            var contentEncoding = connection.getContentEncoding() || "utf-8",
                baos = new Ruby.StringIO,
                length,
                stream = null,
                responseXML = null;

            try{
                var lower = contentEncoding.toLowerCase();
                stream = ( lower == "gzip" || lower == "decompress" ) ?
                        ( Ruby.raise("java") && new java.util.zip.GZIPInputStream(connection.getInputStream()) ) :
                        connection.getInputStream();
            }catch(e){
                if (connection.getResponseCode() == 404)
                    $env.info('failed to open connection stream \n' +
                              e.toString(), e);
                else
                    $env.error('failed to open connection stream \n' +
                               e.toString(), e);
                stream = connection.getErrorStream();
            }
            
            var buffer;
            while ( buffer = stream.read() ) {
                baos.write(buffer);
            }

            baos.close();
            stream.close();

            xhr.responseText = baos.string();
                
        }
        if(responseHandler){
            $env.debug('calling ajax response handler');
            responseHandler();
        }
    };
    
    //var htmlDocBuilder = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();
    // htmlDocBuilder.setNamespaceAware(false);
    // htmlDocBuilder.setValidating(false);
    
    var tidy;
    $env.tidyHTML = false;
    $env.tidy = function(htmlString){
        $env.debug('Cleaning html :\n'+htmlString);
        Ruby.raise("java");
        var xmlString,
		    baos = new java.io.ByteArrayOutputStream(),
		    bais = new java.io.ByteArrayInputStream(
			           (new java.lang.String(htmlString)).
					        getBytes("UTF8"));
		try{
	        if(!tidy){
	            tidy = new org.w3c.tidy.Tidy();
	        }
            $env.debug('tidying');
	        tidy.parse(bais,baos);
                    Ruby.raise("java");
			xmlString = java.nio.charset.Charset.forName("UTF-8").
                decode(java.nio.ByteBuffer.wrap(baos.toByteArray())).toString()+"";
            $env.debug('finished tidying');
		}catch(e){
            $env.error('error in html tidy', e);
        }finally{
            try{
                bais.close();
                baos.close();
            }catch(ee){
                //swallow
            }
        }
        $env.debug('Cleaned html :\n'+xmlString);
        return xmlString;
    };
    
    // var xmlDocBuilder = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();
    // xmlDocBuilder.setNamespaceAware(true);
    // xmlDocBuilder.setValidating(false);
    
    $env.parseXML = function(xmlstring){
                    Ruby.raise("java");
        return xmlDocBuilder.newDocumentBuilder().parse(
                  new java.io.ByteArrayInputStream(
                        (new java.lang.String(xmlstring)).getBytes("UTF8")));
    };
    
    
    $env.xpath = function(expression, doc){
                    Ruby.raise("java");
        return Packages.javax.xml.xpath.
          XPathFactory.newInstance().newXPath().
            evaluate(expression, doc, javax.xml.xpath.XPathConstants.NODESET);
    };
    
    var jsonmlxslt;
    $env.jsonml = function(xmlstring){
        jsonmlxslt = jsonmlxslt||$env.xslt($env.xml2jsonml.toXMLString());
        var jsonml = $env.transform(jsonmlxslt, xmlstring);
        //$env.debug('jsonml :\n'+jsonml);
        return eval(jsonml);
    };
    var transformerFactory;
    $env.xslt = function(xsltstring){
                    Ruby.raise("java");
        transformerFactory = transformerFactory||
            Packages.javax.xml.transform.TransformerFactory.newInstance();
        return transformerFactory.newTransformer(
              new javax.xml.transform.dom.DOMSource(
                  $env.parseXML(xsltstring)
              )
          );
    };
    $env.transform = function(xslt, xmlstring){
                    Ruby.raise("java");
        var baos = new java.io.ByteArrayOutputStream();
        xslt.transform(
            new javax.xml.transform.dom.DOMSource($env.parseHTML(xmlstring)),
            new javax.xml.transform.stream.StreamResult(baos)
        );
        return java.nio.charset.Charset.forName("UTF-8").
            decode(java.nio.ByteBuffer.wrap(baos.toByteArray())).toString()+"";
    };
    
    $env.tmpdir         = Ruby.ENV["TMPDIR"];
    $env.os_name        = Ruby.eval("%x{uname -s}");
    $env.os_arch        = Ruby.eval("%x{uname -p}");
    $env.os_version     = Ruby.eval("%x{uname -r}");
    $env.lang           = Ruby.eval('l = %x{locale}.match(/LANG="([^."]+)[."]/) and l[1] or ""');
    $env.platform       = "Johnson";

    $env.scriptTypes = {
        "text/javascript"   :false,
        "text/envjs"        :true
    };
    
    
    $env.loadInlineScript = function(script){
        var tmpFile = $env.writeToTempFile(script.text, 'js') ;
        $env.debug("loading " + tmpFile);
        $env.loadIntoFnsScope(tmpFile);
        $env.deleteFile(tmpFile);
    };
    
})(Envjs);

// Local Variables:
// espresso-indent-level:4
// c-basic-offset:4
// End:
