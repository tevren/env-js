// Run 'test.js', letting it know that we're running with the vanilla
// unmodified version of the Rhino JS interpreter: rhino.jar

whichJarFile = "rhino"
whichInterpreter = whichJarFile + " interpreter jar";
multiwindow = false;
load("dist/env.rhino.js");
load("test/primaryTests.js");

