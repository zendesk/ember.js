## Send Event

In Ember `0.9.x` `Ember.sendEvent` takes two arguments, and an arbitrary number of parameters to send along with the event.

```js
Ember.sendEvent(object, '@scope:name', 'parameter one', 'parameter two');
```

In Ember `1.x` `Ember.sendEvent` takes the same two first arugments, however the parameters must all be given as an array in the **third** argument. `sendEvent` in `1.x` also takes an optional fourth argument -- an array of actions.

```js
Ember.sendEvent(object, '@scope:name', ['parameter one', 'parameter two']);
```
