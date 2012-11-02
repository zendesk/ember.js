var namespace;

module("Routing - Basic Mapping", {
  setup: function() {
    namespace = {};
  },

  teardown: function() {
  }
});

test("Should be able to map a path to a string", function() {
  var Router = Ember.Router.extend({
    namespace: namespace
  });

  namespace.HomeRoute = Ember.RouteHandler.extend();

  Router.map(function(match) {
    match('/').to('home');
  });

  ok(Ember.Route.detect(Router.states['GET /']), 'creates a router for the given path');
});
