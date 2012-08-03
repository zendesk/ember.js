// ==========================================================================
// Project:  Ember Runtime
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals Global:true */

require('ember-metal/~tests/props_helper');

// ..........................................................
// ADD OBSERVER
//

module('Ember.addObserver');

testBoth('observer should fire when property is modified', function(get,set) {

  var obj = {};
  var count = 0;

  Ember.addObserver(obj, 'foo', function() {
    equal(get(obj, 'foo'), 'bar', 'should invoke AFTER value changed');
    count++;
  });

  Ember.run(function() {
    set(obj, 'foo', 'bar');
  });

  equal(count, 1, 'should have invoked observer');
});

testBoth('observer should fire when dependent property is modified', function(get, set) {
  var obj = { bar: 'bar' };
  Ember.defineProperty(obj, 'foo', Ember.computed(function() {
    return get(this,'bar').toUpperCase();
  }).property('bar'));

  var count = 0;
  Ember.addObserver(obj, 'foo', function() {
    equal(get(obj, 'foo'), 'BAZ', 'should have invoked after prop change');
    count++;
  });

  Ember.run(function() {
    set(obj, 'bar', 'baz');
  });

  equal(count, 1, 'should have invoked observer');
});

testBoth('nested observers should fire in order', function(get,set) {
  var obj = { foo: 'foo', bar: 'bar' };
  var fooCount = 0, barCount = 0;

  Ember.addObserver(obj, 'foo' ,function() { fooCount++; });
  Ember.addObserver(obj, 'bar', function() {
    set(obj, 'foo', 'BAZ');
    //equal(fooCount, 1, 'fooCount should have fired already');
    barCount++;
  });

  Ember.run(function() {
    set(obj, 'bar', 'BIFF');
  });

  equal(barCount, 1, 'barCount should have fired');
  equal(fooCount, 1, 'foo should have fired');
});

testBoth('suspending an observer should not fire during callback', function(get,set) {
  var obj = {}, target, otherTarget;

  target = {
    values: [],
    method: function() { this.values.push(get(obj, 'foo')); }
  };

  otherTarget = {
    values: [],
    method: function() { this.values.push(get(obj, 'foo')); }
  };

  Ember.addObserver(obj, 'foo', target, target.method);
  Ember.addObserver(obj, 'foo', otherTarget, otherTarget.method);

  function callback() {
    equal(this, target);

    Ember.run(function() {
      set(obj, 'foo', '2');
    });

    return 'result';
  }

  Ember.run(function() {
    set(obj, 'foo', '1');
  });

  equal(Ember._suspendObserver(obj, 'foo', target, target.method, callback), 'result');

  Ember.run(function() {
    set(obj, 'foo', '3');
  });

  deepEqual(target.values, ['1', '3'], 'should invoke');
  deepEqual(otherTarget.values, ['1', '2', '3'], 'should invoke');
});


testBoth('suspending an observer should not defer change notifications during callback', function(get,set) {
  var obj = {}, target, otherTarget;

  target = {
    values: [],
    method: function() { this.values.push(get(obj, 'foo')); }
  };

  otherTarget = {
    values: [],
    method: function() { this.values.push(get(obj, 'foo')); }
  };

  Ember.addObserver(obj, 'foo', target, target.method);
  Ember.addObserver(obj, 'foo', otherTarget, otherTarget.method);

  function callback() {
    equal(this, target);

    Ember.run(function() {
      set(obj, 'foo', '2');
    });

    return 'result';
  }

  Ember.run(function() {
    set(obj, 'foo', '1');
  });

  Ember.beginPropertyChanges();
  equal(Ember._suspendObserver(obj, 'foo', target, target.method, callback), 'result');
  Ember.endPropertyChanges();

  Ember.run(function() {
    set(obj, 'foo', '3');
  });

  deepEqual(target.values, ['1', '3'], 'should invoke');
  deepEqual(otherTarget.values, ['1', '2', '3'], 'should invoke');
});

testBoth('deferring property change notifications', function(get,set) {
  var obj = { foo: 'foo' };
  var fooCount = 0;

  Ember.addObserver(obj, 'foo' ,function() { fooCount++; });

  //Ember.beginPropertyChanges(obj);
  Ember.run(function() {
    set(obj, 'foo', 'BIFF');
    set(obj, 'foo', 'BAZ');
  });
  //Ember.endPropertyChanges(obj);

  equal(fooCount, 1, 'foo should have fired once');
});

testBoth('deferring property change notifications safely despite exceptions', function(get,set) {
  var obj = { foo: 'foo' };
  var fooCount = 0;
  var exc = new Error("Something unexpected happened!");

  expect(2);
  Ember.addObserver(obj, 'foo' ,function() { fooCount++; });

  try {
    Ember.run(function() {
      set(obj, 'foo', 'BIFF');
      set(obj, 'foo', 'BAZ');
      throw exc;
    });
  } catch(err) {
    if (err !== exc)
      throw err;
  }

  equal(fooCount, 1, 'foo should have fired once');

  Ember.run(function(){
    set(obj, 'foo', 'BIFF2');
    set(obj, 'foo', 'BAZ2');
  });

  equal(fooCount, 2, 'foo should have fired again once');
});

testBoth('deferring property change notifications will not defer before observers', function(get,set) {
  var obj = { foo: 'foo' };
  var fooCount = 0;

  Ember.addBeforeObserver(obj, 'foo' ,function() { fooCount++; });

  Ember.run(function(){
    set(obj, 'foo', 'BIFF');
    equal(fooCount, 1, 'should fire before observer immediately');
    set(obj, 'foo', 'BAZ');
  });

  equal(fooCount, 1, 'should not fire before observer twice');
});

testBoth('implementing sendEvent on object should invoke when deferring property change notifications ends', function(get, set) {
  var count = 0, events = [];
  var obj = {
    sendEvent: function(eventName) {
      events.push(eventName);
    },
    foo: 'baz'
  };

  Ember.addObserver(obj, 'foo', function() { count++; });

  Ember.run(function() {
    set(obj, 'foo', 'BAZ');

    equal(count, 0, 'should have not invoked observer');
    equal(events.length, 1, 'should have invoked sendEvent for before');
  });

  equal(count, 1, 'should have invoked observer');
  equal(events.length, 2, 'should have invoked sendEvent');
  equal(events[0], 'foo:before');
  equal(events[1], 'foo:change');
});

testBoth('addObserver should propagate through prototype', function(get,set) {
  var obj = { foo: 'foo', count: 0 }, obj2;

  Ember.addObserver(obj, 'foo', function() { this.count++; });
  obj2 = Ember.create(obj);

  Ember.run(function() {
    set(obj2, 'foo', 'bar');
  });

  equal(obj2.count, 1, 'should have invoked observer on inherited');
  equal(obj.count, 0, 'should not have invoked observer on parent');

  obj2.count = 0;
  Ember.run(function() {
    set(obj, 'foo', 'baz');
  });
  equal(obj.count, 1, 'should have invoked observer on parent');
  equal(obj2.count, 0, 'should not have invoked observer on inherited');
});

testBoth('addObserver should respect targets with methods', function(get,set){
  var observed = { foo: 'foo' };

  var target1 = {
    count: 0,

    didChange: function(hash) {
      var value = get(hash.object, hash.name);
      equal(this, target1, 'should invoke with this');
      equal(hash.object, observed, 'should have object');
      equal(hash.name, 'foo', 'should have name');
      equal(hash.type, 'updated', 'should have type of "updated"');
      equal(value, 'BAZ', 'should have value');
      this.count++;
    }
  };

  var target2 = {
    count: 0,

    didChange: function(hash) {
      var value = get(hash.object, hash.name);
      equal(this, target2, 'should invoke with this');
      equal(hash.object, observed, 'should have object');
      equal(hash.name, 'foo', 'should have name');
      equal(hash.type, 'updated', 'should have type of "updated"');
      equal(value, 'BAZ', 'should have value');
      this.count++;
    }
  };

  Ember.addObserver(observed, 'foo', target1, 'didChange');
  Ember.addObserver(observed, 'foo', target2, target2.didChange);

  Ember.run(function() {
    set(observed, 'foo', 'BAZ');
  });
  equal(target1.count, 1, 'target1 observer should have fired');
  equal(target2.count, 1, 'target2 observer should have fired');

});

testBoth('addObserver should allow multiple objects to observe a property', function(get, set) { var observed = { foo: 'foo' };

  var target1 = {
    count: 0,

    didChange: function() {
      this.count++;
    }
  };

  var target2 = {
    count: 0,

    didChange: function() {
      this.count++;
    }
  };

  Ember.addObserver(observed, 'foo', target1, 'didChange');
  Ember.addObserver(observed, 'foo', target2, 'didChange');

  Ember.run(function() {
    set(observed, 'foo', 'BAZ');
  });
  equal(target1.count, 1, 'target1 observer should have fired');
  equal(target2.count, 1, 'target2 observer should have fired');
});

// ..........................................................
// REMOVE OBSERVER
//

module('Ember.removeObserver');

testBoth('removing observer should stop firing', function(get,set) {

  var obj = {};
  var count = 0;
  function F() { count++; }
  Ember.addObserver(obj, 'foo', F);

  Ember.run(function() {
    set(obj, 'foo', 'bar');
  });
  equal(count, 1, 'should have invoked observer');

  Ember.removeObserver(obj, 'foo', F);
});

testBoth('local observers can be removed', function(get, set) {
  var barObserved = 0;

  var MyMixin = Ember.Mixin.create({
    foo1: Ember.observer(function() {
      barObserved++;
    }, 'bar'),

    foo2: Ember.observer(function() {
      barObserved++;
    }, 'bar')
  });

  var obj = {};
  MyMixin.apply(obj);

  Ember.run(function() {
    set(obj, 'bar', 'HI!');
  });
  equal(barObserved, 2, 'precond - observers should be fired');

  Ember.removeObserver(obj, 'bar', null, 'foo1');

  barObserved = 0;
  Ember.run(function() {
    set(obj, 'bar', 'HI AGAIN!');
  });

  equal(barObserved, 1, 'removed observers should not be called');
});

testBoth('removeObserver should respect targets with methods', function(get,set){
  var observed = { foo: 'foo' };

  var target1 = {
    count: 0,

    didChange: function() {
      this.count++;
    }
  };

  var target2 = {
    count: 0,

    didChange: function() {
      this.count++;
    }
  };

  Ember.addObserver(observed, 'foo', target1, 'didChange');
  Ember.addObserver(observed, 'foo', target2, target2.didChange);

  Ember.run(function() {
    set(observed, 'foo', 'BAZ');
  });
  equal(target1.count, 1, 'target1 observer should have fired');
  equal(target2.count, 1, 'target2 observer should have fired');

  Ember.removeObserver(observed, 'foo', target1, 'didChange');
  Ember.removeObserver(observed, 'foo', target2, target2.didChange);

  target1.count = target2.count = 0;
  Ember.run(function() {
    set(observed, 'foo', 'BAZ');
  });
  equal(target1.count, 0, 'target1 observer should not fire again');
  equal(target2.count, 0, 'target2 observer should not fire again');
});

// ..........................................................
// BEFORE OBSERVER
//

module('Ember.addBeforeObserver');

testBoth('observer should fire before a property is modified', function(get,set) {

  var obj = { foo: 'foo' };
  var count = 0;

  Ember.addBeforeObserver(obj, 'foo', function() {
    equal(get(obj, 'foo'), 'foo', 'should invoke before value changed');
    count++;
  });

  Ember.run(function() {
    set(obj, 'foo', 'bar');
  });
  equal(count, 1, 'should have invoked observer');
});

testBoth('observer should fire before dependent property is modified', function(get, set) {
  var obj = { bar: 'bar' };
  Ember.defineProperty(obj, 'foo', Ember.computed(function() {
    return get(this,'bar').toUpperCase();
  }).property('bar'));

  var count = 0;
  Ember.addBeforeObserver(obj, 'foo', function() {
    equal(get(obj, 'foo'), 'BAR', 'should have invoked after prop change');
    count++;
  });

  Ember.run(function() {
    set(obj, 'bar', 'baz');
  });
  equal(count, 1, 'should have invoked observer');
});

testBoth('addBeforeObserver should propagate through prototype', function(get,set) {
  var obj = { foo: 'foo', count: 0 }, obj2;

  Ember.addBeforeObserver(obj, 'foo', function() { this.count++; });
  obj2 = Ember.create(obj);

  Ember.run(function() {
    set(obj2, 'foo', 'bar');
  });
  equal(obj2.count, 1, 'should have invoked observer on inherited');
  equal(obj.count, 0, 'should not have invoked observer on parent');

  obj2.count = 0;
  Ember.run(function() {
    set(obj, 'foo', 'baz');
  });
  equal(obj.count, 1, 'should have invoked oberver on parent');
  equal(obj2.count, 0, 'should not have invoked observer on inherited');
});

testBoth('addBeforeObserver should respect targets with methods', function(get,set){
  var observed = { foo: 'foo' };

  var target1 = {
    count: 0,

    willChange: function(hash) {
      var value = get(hash.object, hash.name);
      equal(this, target1, 'should invoke with this');
      equal(hash.object, observed, 'should have object');
      equal(hash.name, 'foo', 'should have name');
      equal(hash.type, 'updated', 'should have type');
      equal(value, 'foo', 'should be value');
      this.count++;
    }
  };

  var target2 = {
    count: 0,

    willChange: function(hash) {
      var value = get(hash.object, hash.name);
      equal(this, target2, 'should invoke with this');
      equal(hash.object, observed, 'should have object');
      equal(hash.name, 'foo', 'should have name');
      equal(hash.type, 'updated', 'should have type');
      equal(value, 'foo', 'should be value');
      this.count++;
    }
  };

  Ember.addBeforeObserver(observed, 'foo', target1, 'willChange');
  Ember.addBeforeObserver(observed, 'foo', target2, target2.willChange);

  Ember.run(function() {
    set(observed, 'foo', 'BAZ');
  });

  equal(target1.count, 1, 'target1 observer should have fired');
  equal(target2.count, 1, 'target2 observer should have fired');
});

// ..........................................................
// CHAINED OBSERVERS
//

var obj, count;

module('Ember.addObserver - dependentkey with chained properties', {
  setup: function() {
    obj = {
      foo: {
        bar: {
          baz: {
            biff: "BIFF"
          }
        }
      }
    };

    Global = {
      foo: {
        bar: {
          baz: {
            biff: "BIFF"
          }
        }
      }
    };

    count = 0;
  },

  teardown: function() {
    obj = count = Global = null;
  }
});

testBoth('depending on a simple chain', function(get, set) {

  var val ;
  Ember.addObserver(obj, 'foo.bar.baz.biff', function(hash) {
    val = Ember.get(hash.object, hash.name);
    count++;
  });

  Ember.run(function() {
    set(Ember.get(obj, 'foo.bar.baz'), 'biff', 'BUZZ');
  });
  equal(val, 'BUZZ');
  equal(count, 1);

  Ember.run(function() {
    set(Ember.get(obj, 'foo.bar'), 'baz', { biff: 'BLARG' });
  });
  equal(val, 'BLARG');
  equal(count, 2);

  Ember.run(function() {
    set(Ember.get(obj, 'foo'), 'bar', { baz: { biff: 'BOOM' } });
  });
  equal(val, 'BOOM');
  equal(count, 3);

  Ember.run(function() {
    set(obj, 'foo', { bar: { baz: { biff: 'BLARG' } } });
  });
  equal(val, 'BLARG');
  equal(count, 4);

  Ember.run(function() {
    set(Ember.get(obj, 'foo.bar.baz'), 'biff', 'BUZZ');
  });
  equal(val, 'BUZZ');
  equal(count, 5);

  var foo = get(obj, 'foo');

  Ember.run(function() {
    set(obj, 'foo', 'BOO');
  });
  equal(val, undefined);
  equal(count, 6);

  Ember.run(function() {
    set(foo.bar.baz, 'biff', "BOOM");
  });
  equal(count, 6, 'should be not have invoked observer');
});

testBoth('depending on a Global chain', function(get, set) {

  var val ;
  Ember.addObserver(obj, 'Global.foo.bar.baz.biff', function(hash){
    val = Ember.get(window, hash.name);
    count++;
  });

  Ember.run(function() {
    set(Ember.get(Global, 'foo.bar.baz'),  'biff', 'BUZZ');
  });
  equal(val, 'BUZZ');
  equal(count, 1);

  Ember.run(function() {
    set(Ember.get(Global, 'foo.bar'),  'baz', { biff: 'BLARG' });
  });
  equal(val, 'BLARG');
  equal(count, 2);

  Ember.run(function() {
    set(Ember.get(Global, 'foo'),  'bar', { baz: { biff: 'BOOM' } });
  });
  equal(val, 'BOOM');
  equal(count, 3);

  Ember.run(function() {
    set(Global, 'foo', { bar: { baz: { biff: 'BLARG' } } });
  });
  equal(val, 'BLARG');
  equal(count, 4);

  Ember.run(function() {
    set(Ember.get(Global, 'foo.bar.baz'),  'biff', 'BUZZ');
  });
  equal(val, 'BUZZ');
  equal(count, 5);

  var foo = get(obj, 'foo');

  Ember.run(function() {
    set(Global, 'foo', 'BOO');
  });
  equal(val, undefined);
  equal(count, 6);

  Ember.run(function() {
    set(foo.bar.baz, 'biff', "BOOM");
  });
  equal(count, 6, 'should be not have invoked observer');
});

// ..........................................................
// SETTING IDENTICAL VALUES
//

module('props/observer_test - setting identical values');

testBoth('setting simple prop should not trigger', function(get, set) {

  var obj = { foo: 'bar' };
  var count = 0;

  Ember.addObserver(obj, 'foo', function() { count++; });

  Ember.run(function() {
    set(obj, 'foo', 'bar');
  });
  equal(count, 0, 'should not trigger observer');

  Ember.run(function() {
    set(obj, 'foo', 'baz');
  });
  equal(count, 1, 'should trigger observer');

  Ember.run(function() {
    set(obj, 'foo', 'baz');
  });
  equal(count, 1, 'should not trigger observer again');
});

// The issue here is when a computed property is directly set with a value, then has a
// dependent key change (which triggers a cache expiration and recomputation), observers will
// not be fired if the CP setter is called with the last set value.
testBoth('setting a cached computed property whose value has changed should trigger', function(get, set) {
  var obj = {};

  Ember.defineProperty(obj, 'foo', Ember.computed(function(key, value) {
    if (arguments.length === 2) { return value; }
    return get(this, 'baz');
  }).property('baz').cacheable());

  var count = 0;

  Ember.addObserver(obj, 'foo', function() { count++; });

  Ember.run(function() {
    set(obj, 'foo', 'bar');
  });
  equal(count, 1);
  equal(get(obj, 'foo'), 'bar');

  Ember.run(function() {
    set(obj, 'baz', 'qux');
  });
  equal(count, 2);
  equal(get(obj, 'foo'), 'qux');

  get(obj, 'foo');
  Ember.run(function() {
    set(obj, 'foo', 'bar');
  });
  equal(count, 3);
  equal(get(obj, 'foo'), 'bar');
});


module("Ember.beforeObserver");

testBoth("provides previous value to beforeObserver", function(get, set) {
  var obj = { foo: 'bar' };
  var previous;

  Ember.addBeforeObserver(obj, 'foo', function(hash) { previous = hash.oldValue; });

  Ember.run(function() {
    set(obj, 'foo', 'baz');
  });
  equal(previous, 'bar', 'should have previous value');

  Ember.run(function() {
    set(obj, 'foo', 'bar');
  });
  equal(previous, 'baz', 'should have new previous value');
});


module("Ember.immediateObserver");

testBoth("immediate observers should fire synchronously", function(get, set) {
  var obj = {},
      observerCalled = 0,
      mixin;

  // explicitly create a run loop so we do not inadvertently
  // trigger deferred behavior
  Ember.run(function() {
    mixin = Ember.Mixin.create({
      fooDidChange: Ember.immediateObserver(function() {
        observerCalled++;
        equal(get(this, 'foo'), "barbaz", "newly set value is immediately available");
      }, 'foo')
    });

    mixin.apply(obj);

    Ember.defineProperty(obj, 'foo', Ember.computed(function(key, value) {
      if (arguments.length > 1) {
        return value;
      }
      return "yes hello this is foo";
    }).cacheable());

    equal(get(obj, 'foo'), "yes hello this is foo", "precond - computed property returns a value");
    equal(observerCalled, 0, "observer has not yet been called");

    Ember.run(function() {
      set(obj, 'foo', 'barbaz');
    });

    equal(observerCalled, 1, "observer was called once");
  });
});

testBoth("immediate observers are for internal properties only", function(get, set) {
  raises(function() {
    Ember.immediateObserver(Ember.K, 'foo.bar');
  });
});

