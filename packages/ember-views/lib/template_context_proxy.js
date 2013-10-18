var get = Ember.get, set = Ember.set;

Ember.TemplateContextProxy = Ember.Object.extend({
  parentView: null,
  view: null,

  unknownProperty: function(keyName) {
    var view = get(this, 'view'),
        templateName = get(view, 'templateName');

    Ember.deprecate(view.constructor + " accesses " + keyName + " directly from " + templateName + ".", false);

    return view.get(keyName);
  }
});
