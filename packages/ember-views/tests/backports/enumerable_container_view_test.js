var get = Ember.get, getPath = Ember.getPath, set = Ember.set;

var container;

module("ember-views/views/backports/enumerable_container_view_test", {
  setup: function() {
    container = Ember.ContainerView.create({
      childViews: ['aChildView'],
      aChildView: Ember.View.extend({ isAChild: true })
    });

    Ember.run(container, container.appendTo, '#qunit-fixture');
  },

  teardown: function() {
    Ember.run(container, container.destroy);
  }
});

test("supports indexing directly", function() {
  equal(container.objectAt(0), get(container, 'aChildView'));
});

test("supports pushing children directly", function() {
  container.pushObject(Ember.View.create({
    isAnotherChild: true
  }));
  equal(getPath(container, 'childViews.length'), 2);
  equal(getPath(container, 'length'), 2);
});
