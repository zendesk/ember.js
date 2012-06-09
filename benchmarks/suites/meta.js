/*global bench alert*/

before(function() {
  window.obj = Ember.Object.create({
    foo: "bar"
  });
});

/*
bench("get", function() {
  for (var i = 0; i < 100; i++) {
    var foo = window.obj.get('foo');
  }
});
*/

bench("set", function() {
  for (var i = 0; i < 100; i++) {
    window.obj.set('foo', 'baz');
  }
});


after(function() {
  window.obj = undefined;
});
