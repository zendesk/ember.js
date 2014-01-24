# Observer overrides

In Ember 1.0, when a subclass overrides a superclass'
observer method, the overriding subclass method must
explicitly be called with `observes` and the dependent
chain.

In Ember 0.9, an override could be done implicitly, i.e.
`observes` was not required.

## Example

```
# 0.9 working behavior
var MyClass = Em.Object.extend({
  fooDidChange: function() {}.observes('foo');
});

var MySubclass = MyClass.extend({
  fooDidChange: function() {
    this._super();
  }
});
```

```
# 1.0 working behavior
var MyClass = Em.Object.extend({
  fooDidChange: function() {}.observes('foo');
});

var MySubclass = MyClass.extend({
  fooDidChange: function() {
    this._super();
  }.observes('foo')
});
```

