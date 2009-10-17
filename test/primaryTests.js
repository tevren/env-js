load("test/qunit.js");

window.addEventListener("load",function(){
  print("\n\nTesting with " + whichInterpreter);
  print("Handling onload for test.js");
  print("Loading tests.");

  // load("test/unit/timer.js");

  print("Load complete. Running tests.");

//   return;

  if(true) load(
      "test/unit/dom.js",
      "test/unit/window.js",
      "test/unit/elementmembers.js"
  );
  if(false) if (multiwindow)
    load(
      "test/unit/onload.js",
      "test/unit/scope.js",   // must come before frame.js changes page content
      "test/unit/iframe.js",
      "test/unit/events.js",
      "test/unit/multi-window.js"
    );
  if(true)load(
      "test/unit/parser.js",
      "test/unit/timer.js"
  );

  print("Load complete. Running tests.");
});

window.location = "test/index.html";

