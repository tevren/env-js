// console.debug("doc");
setTimeout(function(){
  // console.debug("to");
  var ifd = document.getElementById("if").contentWindow.document;
  // console.debug(ifd);
  var q = ifd.poke();
  console.debug("q",q,q.myl);
  console.debug(document.getElementById("if").contentWindow === q);
  setTimeout(function() {
    document.getElementById("if").contentWindow.location = "iframe2.html";
    setTimeout(function(){
      var y = ifd.poke();
      console.debug("qy",q === y);
      console.debug("q",q,q.myl,q === document.getElementById("if").contentWindow);
      console.debug("y",y,y.myl,y === document.getElementById("if").contentWindow);
      document.getElementById("if").contentWindow.document.poke();
    },2000);
  },2000);
},1000);
