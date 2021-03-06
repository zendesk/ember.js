// ==========================================================================
// Project:  Ember Runtime
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

module("Ember.isEmpty");

test("Ember.isEmpty", function() {
  var string = "string", fn = function() {},
      object = {length: 0};

  equal(true,  Ember.isEmpty(null),      "for null");
  equal(true,  Ember.isEmpty(undefined), "for undefined");
  equal(true,  Ember.isEmpty(""),        "for an empty String");
  equal(false, Ember.isEmpty(true),      "for true");
  equal(false, Ember.isEmpty(false),     "for false");
  equal(false, Ember.isEmpty(string),    "for a String");
  equal(false, Ember.isEmpty(fn),        "for a Function");
  equal(false, Ember.isEmpty(0),         "for 0");
  equal(true,  Ember.isEmpty([]),        "for an empty Array");
  equal(false, Ember.isEmpty({}),        "for an empty Object");
  equal(true,  Ember.isEmpty(object),     "for an Object that has zero 'length'");
});
