/*global bench alert*/


function before() {
  window.obj = Ember.Object.create({
    foo: "bar"
  });
}

function get() {
  for (var i = 0; i < 100; i++) {
    var foo = window.obj.get('foo');
  }
}

function set() {
  for (var i = 0; i < 100; i++) {
    window.obj.set('foo', 'baz');
  }
}


function after() {
  window.obj = undefined;
}

var BENCHMARK_OPTIONS = {async: true, setup: before, teardown: after};

var benchmark = new Benchmark('test', get, BENCHMARK_OPTIONS);

benchmark.run();
