module("elementmembers");

// We ought to have test coverage for all members of all DOM objects, but
// until then, add test cases here for members as they are created

test("attributes common to all HTML elements", function() {
    expect(4);

    // tests for .innerText
    var mtch = document.getElementById('dl').innerText.match(
        /^\s+See this blog entry for more information.\s+Here are/);
    try{ ok(mtch && mtch.length > 0,
        "dl.innerText returns the correct content");
    }catch(e){print(e);}

    mtch = document.getElementById('sndp').innerText.match(/^Everything insid/);
    try{ ok(mtch && mtch.length > 0,
        "p.innerText returns the correct content");
    }catch(e){print(e);}

    try{ ok(document.getElementById('sndp').innerText = "test text" || true,
        "p.innerText= operates without exception");
    }catch(e){print(e);}

    try{ ok(document.getElementById('sndp').innerText == "test text",
        "p.innerText= changes content of element");
    }catch(e){print(e);}
});

