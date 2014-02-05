# Ember.run.scheduleOnce

This fork backports `Ember.run.scheduleOnce` and the `afterRender`
queue from Ember 1.

Usage:

```js
var MyView = Ember.View.extend({
  didInsertElement: function() {
    Ember.run.scheduleOnce('afterRender', this, function(){
      // will run after all views that are currently being
      // rendered, including this one, are done rendering.
    });
  }
});
```

This is preferred over `Em.run.once` or even `Em.run.next`, if your intent is to manipulate the DOM representation of a view.
