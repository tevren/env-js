module("timer");

test("runnable callbacks are run later with timeout of 0", function() {
	expect(2);
	var occurred = 0;
	setTimeout(function(){ 
        occurred = Date.now(); 
    }, 0);
	ok( occurred === 0, "Timeout callback was not executed immediatly" );
    setTimeout(function(){
      ok( occurred !== 0, "Timeout callback executed" );
      start();
    },100);
    stop();
});

test("runnable callbacks are run later with timeout more than 0", function() {
	expect(3);
	var occurred = 0;
	setTimeout(function(){ 
        occurred = Date.now(); 
    }, 1000);
	ok( occurred === 0, "Timeout callback was not executed immediatly" );
    var now = Date.now();
    setTimeout(function(){
      ok( occurred !== 0, "Timeout callback was executed" );
      ok( Date.now()-now >= 1500, "Timeout callback was not executed too early" );
      start();
    },1500);
    stop();
});

test("clearTimeout cancels execution of setTimeout callback", function() {
	expect(2);
	var occurred = 0;
	var id = setTimeout(function(){ 
        occurred = Date.now();
	    ok( false, "callback should not executed after clearTimeout" );
    }, 1000);
	ok( occurred === 0, "Timeout callback was not executed immediatly" );
    clearTimeout(id);
    setTimeout(function(){
	ok( occurred === 0, "Timeout callback was not executed" );
        start();
    },3000);
    stop();
});

// Local Variables:
// espresso-indent-level:4
// c-basic-offset:4
// End:
