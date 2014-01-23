In Ember 0.9, calling `set` during `init` will

 1. set the property
 1. notify all observers and dependent properties

In Ember 1, it only does the first. That is, objects are in a "silent" mode
during `init`.

## Transition

Ember 1 provides an `.on('init')` hook that runs just after `init` finishes.
It is the recommended way of providing additional initialization behavior.

If you have code that looks like

```js
var MyObject = Ember.Object.extend({
  
  init: function() {
    var result = this._super();
    this.set('someArray', []);
  }

});
```

and you expect any dependencies of `someArray` to be notified, you should
change it to

```js
var MyObject = Ember.Object.extend({
  
  initializeSomeArray: function() {
    this.set('someArray', []);
  }.on('init')

});
```
