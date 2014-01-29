# ContainerView as Array

In Ember 0.9, the standard way to manipulate an `Ember.ContainerView` is

```js
someContainerView
  .get('childViews')
  .pushObject(SomeChildView.create());
```

In Ember 1, mutating `childViews` from the outside is deprecated. Instead,
the `ContainerView` itself acts like an array:

```js
someContainerView
  .pushObject(SomeChildView.create());
```

This project backports the acts-as-array behavior from Ember 1.
