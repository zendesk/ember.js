require('ember-states/state');

var get = Ember.get, set = Ember.set;

Ember.ViewState = Ember.State.extend({
  isViewState: true,

  enter: function(stateManager) {
    var view = get(this, 'view'), root, childViews;

    if (view) {
      if (Ember.View.detect(view)) {
        view = view.create();
        set(this, 'view', view);
      }

      Ember.assert('view must be an Ember.View', view instanceof Ember.View);

      root = stateManager.get('rootView');

      if (root) {
        childViews = get(root, 'childViews');
        childViews.pushObject(view);
      } else {
        root = stateManager.get('rootElement') || 'body';
        view.appendTo(root);
      }
    }
  },

  exit: function(stateManager) {
    var view = get(this, 'view');

    if (view) {
      // If the view has a parent view, then it is
      // part of a view hierarchy and should be removed
      // from its parent.
      if (get(view, 'parentView')) {
        view.removeFromParent();
      } else {

        // Otherwise, the view is a "root view" and
        // was appended directly to the DOM.
        view.remove();
      }
    }
  }
});

function ensureViewStateAvailable() {
  var op = {
    warn: Ember.deprecate,
    "1.0": Ember.assert
  }[Ember.ENV.VIEW_STATE] || Ember.K;
  op("Ember.ViewState has been removed from Ember 1.0.");
}

Ember.ViewState.reopenClass({
  extend: function() {
    ensureViewStateAvailable();
    return this._super.apply(this, arguments);
  },

  create: function() {
    ensureViewStateAvailable();
    return this._super.apply(this, arguments);
  }
});