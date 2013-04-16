module("Ember.run.afterAll");

test("gets called after all pending run loops have executed", function() {
  expect(6);

  var runs = 0,
      afterAllRuns = 0;

  Ember.run(function() {
    runs++;
  });

  Ember.run.next(function() {
    runs++;
  });

  Ember.run.next(function() {
    runs++;
  });

  Ember.run.later(function() {
    runs++;
  }, 100);

  equal(runs, 1);

  stop();
  Ember.run.afterAll(function() {
    start();
    afterAllRuns++;
    equal(runs, 4, "All the run loops were executed before afterAll was called");
    equal(afterAllRuns, 1, "The first registered afterAll callback was executed first");
  });

  stop();
  Ember.run.afterAll({foo: "bar"}, function() {
    start();
    afterAllRuns++;
    equal(runs, 4, "All the run loops were executed before afterAll was called");
    equal(afterAllRuns, 2, "Additional afterAll callbacks can be registered");
    deepEqual(this, {foo: "bar"}, "The target was set as this");
  });
});
