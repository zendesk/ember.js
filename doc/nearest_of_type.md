## nearestOfType

Ember 1 deprecates `Ember.View#nearestInstanceOf` in favor of
`Ember.View#nearestOfType`, which also works for `Ember.Mixin`s.
This backports `nearestOfType`, but doesn't deprecate the older
method.
