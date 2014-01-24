// ==========================================================================
// Project:   Ember - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Add a new named queue for rendering views that happens
// after bindings have synced, and a queue for scheduling actions
// that that should occur after view rendering.
var queues = Ember.run.queues;
queues.splice(Ember.$.inArray('actions', queues)+1, 0, 'render', 'afterRender');
