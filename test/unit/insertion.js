module("insertion");

test("inserting SELECT elements with multiple='multiple' should not raise an error", function() {
  expect(1);
  var div = document.createElement('div');
  var html = "<select multiple='multiple'><option value='wheels'>Wheels within Wheels</option></select>";
  ok(div.innerHTML = html, html);  
});
