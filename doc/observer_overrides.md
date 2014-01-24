# Observer overrides

## Related commit

[aad0fafb8b040cb8c5908491667d21303cf31949](https://github.com/zendesk/ember.js/commit/aad0fafb8b040cb8c5908491667d21303cf31949)

## Description

In Ember 1.0, when a subclass overrides a superclass'
observer method, the overriding subclass method must
explicitly be called with `observes` and the dependent
chain.

In Ember 0.9, an override could be done implicitly, i.e.
`observes` was not required.

## Example

```js
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

```js
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

