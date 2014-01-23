# Ember.empty

Ember 1 deprecates `Ember.empty` in favor of `Ember.isEmpty`. This introduces a flag,
`EMBER_EMPTY`, with two values:


 * `null` (the default) -- `Ember.empty` and `Ember.isEmpty` both work without warning
 * `"1.0"` -- `Ember.empty` continues to work, but emits warnings
