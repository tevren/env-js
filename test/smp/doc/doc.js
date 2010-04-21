// console.debug("doc");
setTimeout(function(){
  // console.debug("to");
  var ifd = document.getElementById("if").contentWindow.document;
  // console.debug(ifd);
  ifd.poke();
  setTimeout(function() {
    document.getElementById("if").contentWindow.location = "iframe2.html";
    setTimeout(function(){
      ifd.poke();
      document.getElementById("if").contentWindow.document.poke();
    },2000);
  },2000);
},1000);
