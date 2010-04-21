jQuery(function(){
debug("0",jQuery('#select')[0].innerHTML);
  jQuery('#select')[0].selectedIndex = 1;
debug("1",jQuery('#select')[0].innerHTML);
  jQuery('#select').change();
debug("2",jQuery('#select')[0].innerHTML);
});