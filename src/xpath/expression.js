/**
 * @author thatcher
 */
$debug("Defining XPathExpression");
/*
* XPathExpression 
*/
$w.__defineGetter__("XPathExpression", function(){
    return XPathExpression;
});

var XPathExpression =
  function(xpathText, contextNode, nsuriMapper, resultType, result) {
    if(nsuriMapper != null) {
      throw new Error("nsuriMapper not implemented");
    }
    if(result != null) {
      throw new Error("result not implemented");
    }
    if(resultType!=XPathResult.ANY_TYPE) {
      throw new Error("result type not implemented");
    }
    var context = new ExprContext($w.document);
    this.result = xpathParse(xpathText).evaluate(context);
  };
__extend__(XPathExpression.prototype, {
    evaluate: function(){
      return new XPathResult(this.result);
    }
});