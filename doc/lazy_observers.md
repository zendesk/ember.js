Given a computed property,

```js
var PersonView = Ember.View.extend({
  person: null,

  name: function() {
    return this.get('person.fullName');
  }.property('person.fullName').cacheable()
}
```

Ember 0.9 will set up observers on `person.fullName` as soon as you create a
`PersonView` instance. Ember 1, however, waits until the first time something
fetches `name`. This delay offers performance improvements -- why go through
the cost of setting up observers if nothing needs to recompute the value?

Usually, something (often a template), will be getting the property, so this
isn't a problem. If you find a bug related to this, you should probably change
the relevant application code.

## Transition

This project currently has no tools to aid this transition.
