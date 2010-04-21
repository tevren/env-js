console.debug("if");
window.myl = document.location+"";
old_global = (function(){return this;}());
document.poke = function() {
  var global = (function(){return this;}());
  console.debug([myl,window.location+"",window,window.document,document,window.document===document,
                 global.document === document]+"",global,window===global,global===old_global);
  return global;
};
