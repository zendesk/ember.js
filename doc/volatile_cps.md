In Ember 0.9, you might have a property that looks like

```js
age: function() {
  return this.get('createdAt') - new Date();
}.property('createdAt').volatile()
```

The `.property('createdAt')` means, "recompute this every time `createdAt`
changes".

The `.volatile()` means, "recompute this every time you get it."

That means that if we had a template,

```hdbs
Age: {{age}}
```

the template would be correct on render and when `createdAt` changes.

In Ember 1.0, this does not work. We need to do something more like

```js
age: function() {
  return this.get('createdAt') - new Date();
}.property().volatile()

expireAge: function() {
  this.notifyPropertyChange('age');
}.observes('createdAt')
```

## Transition

This project currently has no tools to aid this transition.
