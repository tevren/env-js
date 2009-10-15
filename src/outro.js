/*
*	outro.js
*/


    };// close function definition begun in 'intro.js'


print ("SMP X",this);

return windowfn;

})().call(this,this,    // object to "window-ify"
                 this,    // a root window's parent is itself
                 null,    // "opener" for new window
                 this,    // "top" for new window
                 true     // identify this as the original (not reloadable) win
                );

} catch(e){
  throw e;
    Envjs.error("ERROR LOADING ENV : " + e + "\nLINE SOURCE:\n" +
        Envjs.lineSource(e));
}
