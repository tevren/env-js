if(!this.whichJarFile){
  whichJarFile = "rhino"
}
whichInterpreter = whichJarFile + " interpreter jar";
if(!this.multiwindow){
  multiwindow = false;
}
load("dist/env.rhino.js");
load("test/qunit.js");
Envjs("test/index.html", {});

test("'index.html' loaded correctly via 'Envjs()' call", function(){
    expect(1);
    try{ ok(document.getElementById('body').id == "body",
        "'index.html' page content available");
    }catch(e){print(e);}
});

test("window.location= following Envjs() initialization flagged as error",
     function(){
    expect(0);
});

Envjs.wait();