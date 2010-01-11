$debug("Defining HTMLElement");
/*
* HTMLElement - DOM Level 2
*/
var HTMLElement = function(ownerDocument) {
    this.DOMElement = DOMElement;
    this.DOMElement(ownerDocument);
    
    this.$css2props = null;
};
HTMLElement.prototype = new DOMElement;
__extend__(HTMLElement.prototype, {

		get className() { 
		    return this.getAttribute("class")||''; 
	    },
		set className(value) { 
		    return this.setAttribute("class",trim(value)); 
		    
	    },
		get dir() { 
		    return this.getAttribute("dir")||"ltr"; 
		    
	    },
		set dir(val) { 
		    return this.setAttribute("dir",val); 
		    
	    },
		get id(){  
		    return this.getAttribute('id'); 
		    
	    },
		set id(id){  
		    this.setAttribute('id', id); 
            
	    },
		get innerHTML(){  
		    return this.childNodes.xml; 
		    
	    },
		set innerHTML(html){
		    //Should be replaced with HTMLPARSER usage
            //$debug('SETTING INNER HTML ('+this+'+'+html.substring(0,64));
            var doc = new HTMLDocument($implementation,null,"");
            $w.parseHtmlDocument(html,doc,null,null,true);
            var parent = doc.body;
			while(this.firstChild != null){
			    this.removeChild( this.firstChild );
			}
			var importedNode;
			while(parent.firstChild != null){
	            importedNode = this.importNode( 
	                parent.removeChild( parent.firstChild ), true);
			    this.appendChild( importedNode );   
		    }
		    //Mark for garbage collection
		    doc = null;
		},
        get innerText(){
            return __recursivelyGatherText__(this);
        },
        set innerText(newText){
			while(this.firstChild != null){
			    this.removeChild( this.firstChild );
			}
            var text = this.ownerDocument.createTextNode(newText);
            this.appendChild(text);
        },
		get lang() { 
		    return this.getAttribute("lang"); 
		    
	    },
		set lang(val) { 
		    return this.setAttribute("lang",val); 
		    
	    },
		get offsetHeight(){
		    return Number(this.style["height"].replace("px",""));
		},
		get offsetWidth(){
		    return Number(this.style["width"].replace("px",""));
		},
		offsetLeft: 0,
		offsetRight: 0,
		get offsetParent(){
		    /* TODO */
		    return;
	    },
		set offsetParent(element){
		    /* TODO */
		    return;
	    },
		scrollHeight: 0,
		scrollWidth: 0,
		scrollLeft: 0, 
		scrollRight: 0,
		get style(){
		    if(this.$css2props === null){
	            this.$css2props = new CSS2Properties(this);
	        }
	        return this.$css2props;
		},
        set style(values){
		    __updateCss2Props__(this, values);
        },
		setAttribute: function (name, value) {
            DOMElement.prototype.setAttribute.apply(this,[name, value]);
		    if (name === "style") {
		        __updateCss2Props__(this, value);
		    }
		},
		get title() { 
		    return this.getAttribute("title"); 
		    
	    },
		set title(value) { 
		    return this.setAttribute("title", value); 
		    
	    },
		get tabIndex(){
            var ti = this.getAttribute('tabindex');
            if(ti!==null)
                return Number(ti);
            else
                return 0;
        },
        set tabIndex(value){
            if(value===undefined||value===null)
                value = 0;
            this.setAttribute('tabindex',Number(value));
        },
		//Not in the specs but I'll leave it here for now.
		get outerHTML(){ 
		    return this.xml; 
		    
	    },
	    scrollIntoView: function(){
	        /*TODO*/
	        return;
	    
        },

		onclick: function(event){
		    __eval__(this.getAttribute('onclick')||'', this);
	    },
        

		ondblclick: function(event){
            __eval__(this.getAttribute('ondblclick')||'', this);
	    },
		onkeydown: function(event){
            __eval__(this.getAttribute('onkeydown')||'', this);
	    },
		onkeypress: function(event){
            __eval__(this.getAttribute('onkeypress')||'', this);
	    },
		onkeyup: function(event){
            __eval__(this.getAttribute('onkeyup')||'', this);
	    },
		onmousedown: function(event){
            __eval__(this.getAttribute('onmousedown')||'', this);
	    },
		onmousemove: function(event){
            __eval__(this.getAttribute('onmousemove')||'', this);
	    },
		onmouseout: function(event){
            __eval__(this.getAttribute('onmouseout')||'', this);
	    },
		onmouseover: function(event){
            __eval__(this.getAttribute('onmouseover')||'', this);
	    },
		onmouseup: function(event){
            __eval__(this.getAttribute('onmouseup')||'', this);
	    }
});

var __recursivelyGatherText__ = function(aNode) {
    var accumulateText = "";
    var idx; var n;
    for (idx=0;idx < aNode.childNodes.length;idx++){
        n = aNode.childNodes.item(idx);
        if(n.nodeType == DOMNode.TEXT_NODE)
            accumulateText += n.data;
        else
            accumulateText += __recursivelyGatherText__(n);
    }

    return accumulateText;
};
    
var __eval__ = $env.__eval__ || function(script, startingNode){
    if (script == "")
        return;                    // don't assemble environment if no script...

    try{
        var doEval = function(scriptText){
            eval(scriptText);
        };

        var listOfScopes = [];
        for (var node = startingNode; node != null; node = node.parentNode)
            listOfScopes.push(node);
        listOfScopes.push($w);


        var oldScopesArray = $env.configureScope(
          doEval,        // the function whose scope chain to change
          listOfScopes); // last array element is "head" of new chain
        doEval.call(startingNode, script);
        $env.restoreScope(oldScopesArray);
                         // oldScopesArray is N-element array of two-element
                         // arrays.  First element is JS object whose scope
                         // was modified, second is original value to restore.
    }catch(e){
        $error(e);
    }
};

var __updateCss2Props__ = function(elem, values){
    if(elem.$css2props === null){
        elem.$css2props = new CSS2Properties(elem);
    }
    __cssTextToStyles__(elem.$css2props, values);
};

var __registerEventAttrs__ = function(elm){
    if(elm.hasAttribute('onclick')){ 
        elm.addEventListener('click', elm.onclick ); 
    }
    if(elm.hasAttribute('ondblclick')){ 
        elm.addEventListener('dblclick', elm.onclick ); 
    }
    if(elm.hasAttribute('onkeydown')){ 
        elm.addEventListener('keydown', elm.onclick ); 
    }
    if(elm.hasAttribute('onkeypress')){ 
        elm.addEventListener('keypress', elm.onclick ); 
    }
    if(elm.hasAttribute('onkeyup')){ 
        elm.addEventListener('keyup', elm.onclick ); 
    }
    if(elm.hasAttribute('onmousedown')){ 
        elm.addEventListener('mousedown', elm.onclick ); 
    }
    if(elm.hasAttribute('onmousemove')){ 
        elm.addEventListener('mousemove', elm.onclick ); 
    }
    if(elm.hasAttribute('onmouseout')){ 
        elm.addEventListener('mouseout', elm.onclick ); 
    }
    if(elm.hasAttribute('onmouseover')){ 
        elm.addEventListener('mouseover', elm.onclick ); 
    }
    if(elm.hasAttribute('onmouseup')){ 
        elm.addEventListener('mouseup', elm.onclick ); 
    }
    return elm;
};
	
// non-ECMA function, but no other way for click events to enter env.js
var  __click__ = function(element){
    var event = new Event({
      target:element,
      currentTarget:element
    });
    event.initEvent("click");
    element.dispatchEvent(event);
};
var __submit__ = function(element){
	var event = new Event({
	  target:element,
	  currentTarget:element
	});
	event.initEvent("submit");
	element.dispatchEvent(event);
};
var __focus__ = function(element){
	var event = new Event({
	  target:element,
	  currentTarget:element
	});
	event.initEvent("focus");
	element.dispatchEvent(event);
};
var __blur__ = function(element){
	var event = new Event({
	  target:element,
	  currentTarget:element
	});
	event.initEvent("blur");
	element.dispatchEvent(event);
};

$w.HTMLElement = HTMLElement;

// Local Variables:
// espresso-indent-level:4
// c-basic-offset:4
// tab-width:4
// End:
