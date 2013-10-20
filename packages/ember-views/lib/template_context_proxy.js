var get = Ember.get, set = Ember.set,
    addBeforeObserver = Ember.addBeforeObserver,
    addObserver = Ember.addObserver,
    removeBeforeObserver = Ember.removeBeforeObserver,
    removeObserver = Ember.removeObserver,
    propertyWillChange = Ember.propertyWillChange,
    propertyDidChange = Ember.propertyDidChange,
    meta = Ember.meta,
    defineProperty = Ember.defineProperty;

function viewPropertyWillChange(content, viewKey) {
  var key = viewKey.slice(5); // remove "view."
  if (key in this) { return; }  // if shadowed in proxy
  propertyWillChange(this, key);
}

function viewPropertyDidChange(content, viewKey) {
  var key = viewKey.slice(5); // remove "view."
  if (key in this) { return; } // if shadowed in proxy
  propertyDidChange(this, key);
}


Ember.TemplateContextProxy = Ember.Object.extend({
  parentView: null,
  view: null,

  willWatchProperty: function (key) {
    var viewKey = 'view.' + key;
    addBeforeObserver(this, viewKey, null, viewPropertyWillChange);
    addObserver(this, viewKey, null, viewPropertyDidChange);
  },

  didUnwatchProperty: function (key) {
    var viewKey = 'view.' + key;
    removeBeforeObserver(this, viewKey, null, viewPropertyWillChange);
    removeObserver(this, viewKey, null, viewPropertyDidChange);
  },

  unknownProperty: function(keyName) {
    var view = get(this, 'view'),
        templateName = get(view, 'templateName');

    Ember.deprecate(view.constructor + " accesses " + keyName + " directly from " + templateName + ".", false);

    return view.get(keyName);
  },

  setUnknownProperty: function(keyName, value) {
    var view = get(this, 'view'),
        templateName = get(view, 'templateName');

    Ember.deprecate(view.constructor + " sets " + keyName + " directly from " + templateName + ".", false);

    return set(view, keyName, value);
  }
});
