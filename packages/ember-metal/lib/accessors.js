// ==========================================================================
// Project:  Ember Metal
// Copyright: ©2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

require('ember-metal/core');
require('ember-metal/platform');
require('ember-metal/utils');

var USE_ACCESSORS = Ember.platform.hasPropertyAccessors && Ember.ENV.USE_ACCESSORS;
Ember.USE_ACCESSORS = !!USE_ACCESSORS;

var meta = Ember.meta;

// ..........................................................
// GET AND SET
//
// If we are on a platform that supports accessors we can get use those.
// Otherwise simulate accessors by looking up the property directly on the
// object.

var get, set;

var LEVEL_09_WITH_WARNINGS    = '0.9-dotted-properties',
    LEVEL_10_WITHOUT_WARNINGS = '1.0-no-warn',
    LEVEL_10                  = '1.0';

/** @private */
get = function get(obj, keyName) {
  if (keyName === undefined && 'string' === typeof obj) {
    keyName = obj;
    obj = Ember;
  }

  var is10 = Ember.ENV.ACCESSORS === LEVEL_10 || Ember.ENV.ACCESSORS === LEVEL_10_WITHOUT_WARNINGS,
      hasDot = keyName.indexOf('.') !== -1;

  if (is10 && hasDot) {
    return getPathWithoutDeprecation(obj, keyName);
  }

  if (Ember.ENV.ACCESSORS === LEVEL_09_WITH_WARNINGS) {
    Ember.deprecate("The behavior of `get` has changed in Ember 1.0. It will no longer support keys with periods in them.", !hasDot);
  }

  if (!obj) return undefined;
  var ret = obj[keyName];
  if (ret===undefined && 'function'===typeof obj.unknownProperty) {
    ret = obj.unknownProperty(keyName);
  }
  return ret;
};

/** @private */
set = function set(obj, keyName, value) {
  var is10 = Ember.ENV.ACCESSORS === LEVEL_10 || Ember.ENV.ACCESSORS === LEVEL_10_WITHOUT_WARNINGS,
      hasDot = keyName.indexOf('.') !== -1;

  if (is10 && hasDot) {
    return setPath(obj, keyName, value);
  }

  if (Ember.ENV.ACCESSORS === LEVEL_09_WITH_WARNINGS) {
    Ember.deprecate("The behavior of `set` has changed in Ember 1.0. It will no longer support keys with periods in them.", keyName.indexOf('.') === -1);
  }

  if (('object'===typeof obj) && !(keyName in obj)) {
    if ('function' === typeof obj.setUnknownProperty) {
      obj.setUnknownProperty(keyName, value);
    } else if ('function' === typeof obj.unknownProperty) {
      obj.unknownProperty(keyName, value);
    } else obj[keyName] = value;
  } else {
    obj[keyName] = value;
  }
  return value;
};

if (!USE_ACCESSORS) {

  var o_get = get, o_set = set;

  /** @private */
  get = function(obj, keyName) {
    if (keyName === undefined && 'string' === typeof obj) {
      keyName = obj;
      obj = Ember;
    }

    Ember.assert("You need to provide an object and key to `get`.", !!obj && keyName);

    var is10 = Ember.ENV.ACCESSORS === LEVEL_10 || Ember.ENV.ACCESSORS === LEVEL_10_WITHOUT_WARNINGS,
        hasDot = keyName.indexOf('.') !== -1;

    if (is10 && hasDot) {
      return getPathWithoutDeprecation(obj, keyName);
    }

    if (!obj) return undefined;
    var desc = meta(obj, false).descs[keyName];
    if (desc) {
      if (Ember.ENV.ACCESSORS === LEVEL_09_WITH_WARNINGS) {
        Ember.deprecate("The behavior of `get` has changed in Ember 1.0. It will no longer support keys with periods in them.", !hasDot);
      }
      return desc.get(obj, keyName);
    } else {
      return o_get(obj, keyName);
    }
  };

  /** @private */
  set = function(obj, keyName, value) {
    Ember.assert("You need to provide an object and key to `set`.", !!obj && keyName !== undefined);

    var is10 = Ember.ENV.ACCESSORS === LEVEL_10 || Ember.ENV.ACCESSORS === LEVEL_10_WITHOUT_WARNINGS,
        hasDot = keyName.indexOf('.') !== -1;

    if (is10 && hasDot) {
      return setPath(obj, keyName, value);
    }

    var desc = meta(obj, false).descs[keyName];
    if (desc) {
      if (Ember.ENV.ACCESSORS === LEVEL_09_WITH_WARNINGS) {
        Ember.deprecate("The behavior of `set` has changed in Ember 1.0. It will no longer support keys with periods in them.", !hasDot);
      }
      desc.set(obj, keyName, value);
    } else {
      o_set(obj, keyName, value);
    }
    return value;
  };

}

/**
  @function

  Gets the value of a property on an object.  If the property is computed,
  the function will be invoked.  If the property is not defined but the
  object implements the unknownProperty() method then that will be invoked.

  If you plan to run on IE8 and older browsers then you should use this
  method anytime you want to retrieve a property on an object that you don't
  know for sure is private.  (My convention only properties beginning with
  an underscore '_' are considered private.)

  On all newer browsers, you only need to use this method to retrieve
  properties if the property might not be defined on the object and you want
  to respect the unknownProperty() handler.  Otherwise you can ignore this
  method.

  Note that if the obj itself is null, this method will simply return
  undefined.

  @param {Object} obj
    The object to retrieve from.

  @param {String} keyName
    The property key to retrieve

  @returns {Object} the property value or null.
*/
Ember.get = get;

/**
  @function

  Sets the value of a property on an object, respecting computed properties
  and notifying observers and other listeners of the change.  If the
  property is not defined but the object implements the unknownProperty()
  method then that will be invoked as well.

  If you plan to run on IE8 and older browsers then you should use this
  method anytime you want to set a property on an object that you don't
  know for sure is private.  (My convention only properties beginning with
  an underscore '_' are considered private.)

  On all newer browsers, you only need to use this method to set
  properties if the property might not be defined on the object and you want
  to respect the unknownProperty() handler.  Otherwise you can ignore this
  method.

  @param {Object} obj
    The object to modify.

  @param {String} keyName
    The property key to set

  @param {Object} value
    The value to set

  @returns {Object} the passed value.
*/
Ember.set = set;

// ..........................................................
// PATHS
//

/** @private */
function cleanupStars(path) {
  if (path.indexOf('*') === -1 || path === '*') return path;

  Ember.deprecate('Star paths are now treated the same as normal paths', !/(^|[^\.])\*/.test(path));

  return path.replace(/(^|.)\*/, function(match, char){
    return (char === '.') ? match : (char + '.');
  });
}

/** @private */
function normalizePath(path) {
  Ember.assert('must pass non-empty string to normalizePath()', path && path!=='');
  path = cleanupStars(path);

  if (path==='*') return path; //special case...
  var first = path.charAt(0);
  if(first==='.') return 'this'+path;
  return path;
}

// assumes normalized input; no *, normalized path, always a target...
/** @private */
function getPath(target, path) {
  var len = path.length, idx, next, key;

  path = cleanupStars(path);

  idx = 0;
  while(target && idx<len) {
    next = path.indexOf('.', idx);
    if (next<0) next = len;
    key = path.slice(idx, next);
    target = key==='*' ? target : get(target, key);

    if (target && target.isDestroyed) { return undefined; }

    idx = next+1;
  }
  return target ;
}

var TUPLE_RET = [];
var IS_GLOBAL = /^([A-Z$]|([0-9][A-Z$]))/;
var IS_GLOBAL_PATH = /^([A-Z$]|([0-9][A-Z$])).*[\.\*]/;
var HAS_THIS  = /^this[\.\*]/;
var FIRST_KEY = /^([^\.\*]+)/;

/** @private */
function firstKey(path) {
  return path.match(FIRST_KEY)[0];
}

// assumes path is already normalized
/** @private */
function normalizeTuple(target, path) {
  var hasThis  = HAS_THIS.test(path),
      isGlobal = !hasThis && IS_GLOBAL_PATH.test(path),
      key;

  if (!target || isGlobal) target = window;
  if (hasThis) path = path.slice(5);

  path = cleanupStars(path);

  if (target === window) {
    key = firstKey(path);
    target = get(target, key);
    path   = path.slice(key.length+1);
  }

  // must return some kind of path to be valid else other things will break.
  if (!path || path.length===0) throw new Error('Invalid Path');

  TUPLE_RET[0] = target;
  TUPLE_RET[1] = path;
  return TUPLE_RET;
}

/**
  @private

  Normalizes a path to support older-style property paths beginning with . or

  @function
  @param {String} path path to normalize
  @returns {String} normalized path
*/
Ember.normalizePath = normalizePath;

/**
  @private

  Normalizes a target/path pair to reflect that actual target/path that should
  be observed, etc.  This takes into account passing in global property
  paths (i.e. a path beginning with a captial letter not defined on the
  target) and * separators.

  @param {Object} target
    The current target.  May be null.

  @param {String} path
    A path on the target or a global property path.

  @returns {Array} a temporary array with the normalized target/path pair.
*/
Ember.normalizeTuple = function(target, path) {
  return normalizeTuple(target, normalizePath(path));
};

Ember.normalizeTuple.primitive = normalizeTuple;

Ember.getWithDefault = function(root, key, defaultValue) {
  var value = Ember.get(root, key);

  if (value === undefined) { return defaultValue; }
  return value;
};

var getPathWithoutDeprecation = Ember.getPathWithoutDeprecation = function(root, path) {
  var hasThis, isGlobal, ret;

  // Helpers that operate with 'this' within an #each
  if (path === '') {
    return root;
  }

  if (!path && 'string'===typeof root) {
    path = root;
    root = null;
  }

  path = cleanupStars(path);

  // If there is no root and path is a key name, return that
  // property from the global object.
  // E.g. getPath('Ember') -> Ember
  if (root === null && path.indexOf('.') < 0) { return get(window, path); }

  // detect complicated paths and normalize them
  path = normalizePath(path);
  hasThis  = HAS_THIS.test(path);

  if (!root || hasThis) {
    var tuple = normalizeTuple(root, path);
    root = tuple[0];
    path = tuple[1];
    tuple.length = 0;
  }

  return getPath(root, path);
};

Ember.getPath = function(root, path) {
  if (Ember.ENV.ACCESSORS === LEVEL_10) {
    Ember.deprecate("getPath is deprecated since get now supports paths");
  }

  return getPathWithoutDeprecation(root, path);
};

function setPath(root, path, value, tolerant) {
  var keyName;

  if (arguments.length===2 && 'string' === typeof root) {
    value = path;
    path = root;
    root = null;
  }

  path = normalizePath(path);

  if (path.indexOf('.') > 0) {
    keyName = path.slice(path.lastIndexOf('.')+1);
    path    = path.slice(0, path.length-(keyName.length+1));
    if (path !== 'this') {
      root = getPathWithoutDeprecation(root, path);
    }

  } else {
    if (IS_GLOBAL.test(path)) throw new Error('Invalid Path');
    keyName = path;
  }

  if (!keyName || keyName.length===0 || keyName==='*') {
    throw new Error('Invalid Path');
  }

  if (!root) {
    if (tolerant) { return; }
    else { throw new Error('Object in path '+path+' could not be found or was destroyed.'); }
  }

  return Ember.set(root, keyName, value);
}

Ember.setPath = function(root, path, value, tolerant) {
  if (Ember.ENV.ACCESSORS === LEVEL_10) {
    Ember.deprecate("setPath is deprecated since set now supports paths");
  }

  return setPath.apply(Ember, arguments);
};

/**
  Error-tolerant form of Ember.setPath. Will not blow up if any part of the
  chain is undefined, null, or destroyed.

  This is primarily used when syncing bindings, which may try to update after
  an object has been destroyed.
*/
var trySet = Ember.trySet = function(root, path, value) {
  if (arguments.length===2 && 'string' === typeof root) {
    value = path;
    path = root;
    root = null;
  }

  return setPath(root, path, value, true);
};

Ember.trySetPath = function(root, path, value) {
  if (Ember.ENV.ACCESSORS === LEVEL_10) {
    Ember.deprecate("trySetPath has been renamed to trySet");
  }

  return trySet(root, path, value);
};

/**
  Returns true if the provided path is global (e.g., "MyApp.fooController.bar")
  instead of local ("foo.bar.baz").

  @param {String} path
  @returns Boolean
*/
Ember.isGlobalPath = function(path) {
  return !HAS_THIS.test(path) && IS_GLOBAL.test(path);
};
