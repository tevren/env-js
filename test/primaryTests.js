window.onload = function(){
  print("\n\nTesting with " + whichInterpreter);
  print("Handling onload for test.js");
  load("test/testrunner.js");
  print("Loaded test runner. Loading tests.");

  load(
      "test/unit/dom.js",
      "test/unit/window.js",
      "test/unit/elementmembers.js"
  );
  if (whichJarFile == "envjs")
    load(
      "test/unit/onload.js",
      "test/unit/scope.js",   // must come before frame.js changes page content
      "test/unit/iframe.js",
      "test/unit/events.js",
      "test/unit/multi-window.js"
    );
  load(
      "test/unit/parser.js",
      "test/unit/timer.js",

      //NOTE: keep this test last because Prototype pollutes
      //the namespace and several DOM objects
      "test/unit/prototypecompat.js"
  );

  results();    // Display
};

window.location = "test/index.html";

