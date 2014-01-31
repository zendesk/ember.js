## Send Event

In Ember `0.9.x` `Ember.sendEvent` takes two arguments, and an arbitrary number of parameters to send along with the event.

```js
Ember.sendEvent(object, '@scope:name', 'parameter one', 'parameter two');
```

In Ember `1.x` `Ember.sendEvent` takes the same two first arugments, however the parameters must all be given as an array in the **third** argument. `sendEvent` in `1.x` also takes an optional fourth argument -- an array of actions.

```js
Ember.sendEvent(object, '@scope:name', ['parameter one', 'parameter two']);
```
### Upgrade Guide

Unfortunately there is no easy way for us to add a feature flag to deal with `Ember.sendEvent`. It is difficult to tell the intention of the third argument.
It may be an array intended to be passed to an event on `Ember 0.9.x`. Or, it may be a list of arguments, intended for use in `Ember 1.x`.

The solution we're using is to detect how many arguments `Ember.sendEvent` is expecting. If it is expecting `2 + n`, then we assume `Ember 0.9.x` behavior. If `sendEvent` is expecting `4` arguments, then we assume `Ember 1.x` behavior.

For an example you can look at the `sendEvent` usage in Ember Resource:

https://github.com/zendesk/ember-resource/blob/afecfb1ea2dce374a76b91415a22c80d53942125/src/base.js#L17-33

```js
window.Ember.Resource.sendEvent = (function() {
  if (Ember.sendEvent.length === 2) {
    // If Ember 0.9, make an Ember 1.0-style function out of the
    // Ember 0.9 one:
    return function sendEvent(obj, eventName, params, actions) {
      Ember.warn("Ember.Resources.sendEvent can't do anything with actions on Ember 0.9", !actions);
      params = params || [];
      params.unshift(eventName);
      params.unshift(obj);
      return Ember.sendEvent.apply(Ember, params);
    };
  }

  return function sendEvent(obj, eventName, params, actions) {
    return Ember.sendEvent(obj, eventName, params, actions);
  };
}());
```
