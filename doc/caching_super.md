If you cache `this._super` in a method and call it in after a promise resolves, or in a callback

```js
init: function() {
  var self = this,
      thisSuper = this._super,
      args = arguments;
      
  someFunctionThatReturnsAPromise().done(function() {
    thisSuper.apply(self, args);
  });
}
```

Ember 0.9 will call `init`s super function, as expected.

The latest version of Ember relies on additional properties on `this` to call the correct method chain. And, if you
cache `this._super` like this, they will not be present and the call will silently fail.

## Transition

