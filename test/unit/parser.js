// environment mocking for parser
$w = { }
$env = { debug: function() {} }
$openingWindow = $parentWindow = $initTop = null;
this.options = this.options || {}

load("src/window/window.js", "src/dom/parser.js", "src/dom/entities.js");

module("parser");

test("Entity replaced", function() {
    expect(14);
    var htmlstr = "<html><body>Hello, &quot;World&quot;!</body></html>";
    var p = new XMLP(htmlstr);
    equals(XMLP._ELM_B, p.next(), "Opening html tag"); // _ELM_B <html>
    equals(XMLP._ELM_B, p.next(), "Opening body tag"); // _ELM_B <body>

    equals(XMLP._TEXT, p.next(), "Parser emits text event");
    var actual = p.getContent().substring(p.getContentBegin(), p.getContentEnd());
    equals("Hello, ", actual, "Parser content set");
    equals(XMLP._ENTITY, p.next(), "Parser emits entity event");

    actual = p.getContent().substring(p.getContentBegin(), p.getContentEnd());
    equals('"', actual, "Parser replaces &quot; entity");

    equals(XMLP._TEXT, p.next(), "Parser emits second text event");
    actual = p.getContent().substring(p.getContentBegin(), p.getContentEnd());
    equals("World", actual, "Parser content set");

    equals(XMLP._ENTITY, p.next(), "Parser emits second entity event");
    actual = p.getContent().substring(p.getContentBegin(), p.getContentEnd());
    equals('"', actual, "Parser replaces second &quot; entity");

    equals(XMLP._TEXT, p.next(), "Parser emits third text event");
    actual = p.getContent().substring(p.getContentBegin(), p.getContentEnd());
    equals('!', actual, "Parser content set");

    equals(XMLP._ELM_E, p.next(), "Closing body tag"); // _ELM_E </body>
    equals(XMLP._ELM_E, p.next(), "Closing html tag"); // _ELM_E </html>
});

test("HTML standard entities spot-check", function() {
    // test definition
    var numentities = 23;
    var numexpect = 2 + (4*numentities);
    expect(numexpect)
    var htmlstr  = "<html><body>&quot; &amp; &lt; &gt; "+
                   "&nbsp; &copy; &reg; &yen; &para; " +
                   "&Ecirc; &Otilde; &aelig; &divide; &Kappa; &theta; "+
                   "&bull; &hellip; &trade; &rArr; &sum; &clubs; " +
                   "&ensp; &mdash; </body></html>";
    var expected = [            '"',   '&',  '<', '>',
                   '\xA0', '\xA9','\xAE','\xA5','\xB6',
                   '\xCA',  '\xD5',  '\xE6', '\xF7', '\u039A','\u03B8',
                   '\u2022','\u2026','\u2122','\u21D2','\u2211','\u2663',
                   '\u2002','\u2014'  ];

    // get started
    var p = new XMLP(htmlstr);
    equals(XMLP._ELM_B, p.next(), "Opening html tag"); // _ELM_B <html>
    equals(XMLP._ELM_B, p.next(), "Opening body tag"); // _ELM_B <body>

    // check entities
    for (idx=0; idx < numentities; idx++) {
	equals(XMLP._ENTITY, p.next(), "Parser emits entity event -- '" +
                                       expected[idx] + "'");
	actual = p.getContent().substring(
                     p.getContentBegin(), p.getContentEnd());
	equals(expected[idx], actual, "Parser replaces entity -- '" +
                                       expected[idx] + "'");

	equals(XMLP._TEXT, p.next(), "Parser emits text event");
	actual = p.getContent().substring(
                     p.getContentBegin(), p.getContentEnd());
	equals(" ", actual, "Parser content set");
    }
});

test("Toggle entity replacement", function() {
    expect(6);
    var htmlstr = "<html><body>Hello, &quot;World&quot;!</body></html>";
    var p = new XMLP(htmlstr);
    p.replaceEntities = false;
    equals(XMLP._ELM_B, p.next(), "Opening html tag"); // _ELM_B <html>
    equals(XMLP._ELM_B, p.next(), "Opening body tag"); // _ELM_B <body>

    equals(XMLP._TEXT, p.next(), "Parser emits text event");
    var actual = p.getContent().substring(p.getContentBegin(), p.getContentEnd());
    equals("Hello, &quot;World&quot;!", actual, "Parser content set");

    equals(XMLP._ELM_E, p.next(), "Closing body tag"); // _ELM_E </body>
    equals(XMLP._ELM_E, p.next(), "Closing html tag"); // _ELM_E </html>
});
/**
test("Clean HTML", function() {
    expect(3);
    var domParser = new DOMParser(),
    	htmlstr = "<div><p>this is a pig... &apos;oink! oink!&apos;</div>";
        
    Envjs.tidyHTML = true;
    equals(Envjs.tidy(htmlstr), 
        "<div><p>this is a pig... 'oink! oink!'</p></div>",
        'got expected xmlstring');
        
    
    var domnode = domParser.parseFromString(htmlstr);
    ok(domnode, 'Malformed p was parsed without error');
    equals(domnode.xml, 
        "<div><p>this is a pig... 'oink! oink!'</p></div>",
        'got expected value for .xml');
    Envjs.tidyHTML = false;

});*/
