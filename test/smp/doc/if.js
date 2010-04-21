console.debug("if");
window.myl = document.location+"";
(function(){
  document.poke = function() {
    alert([myl,window.location+"",window,window.document,document,window.document===document]+"");
  };
}());