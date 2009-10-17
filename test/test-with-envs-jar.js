// Run 'test.js', letting it know that we're running with our customized
// version of the JS interpreter: env-js.jar

whichJarFile = "envjs";
whichInterpreter = whichJarFile + " interpreter jar";
multiwindow = true;
load("dist/env.rhino.js");
load("test/primaryTests.js");
