/*
  This module copies most of the view rendering portion of express, and piggy-backs on an existing express app in order to 
  render HTML views to be used for emails (or other purposes that do not require outputting to the browser)

  Usage:
  expressRender = require('express-render').init(express, app);
  expressRender.render("template", {locals: {my: "local", vars: true}}, callback);


*/
var util = require('./connect-utils');
util = util.merge(util, require('./express-utils')); 

module.exports = expressRender;

function expressRender(express, app) {
  this.express = express;
  this.app = app;
  this._locals = {};
}

expressRender.init = function(express, app) {
  return new this(express, app);
};

expressRender.prototype.helpers = expressRender.prototype.locals = function(obj) {
  util.union(this._locals, obj);
  return this._locals;
};

expressRender.prototype.layout = function(layout) {
  this._layout = layout;
  return this._layout;
}

expressRender.prototype.views = function(dir) {
  this._views = dir;
  return this._views
}

// Most of this function is copied directly from Express in order to replicate its res.render behavior
expressRender.prototype.render = function(view, opts, fn, parent, sub) {
  if(!this.express || !this.app) {
    var error = new Error('Module was not initialized. Intialize with init() before rendering.');
    if(fn) {
      fn(error);
    } else {
      throw error;
    }
  }
  var options = {}
  , express = this.express
  , app = this.app
  , helpers = this._locals
  , viewOptions = app.set('view options')
  , root = this._views || app.set('views') || process.cwd() + '/views';

  // cache id
  var cid = app.enabled('view cache')
    ? view + (parent ? ':' + parent.path : '')
    : false;

  // merge "view options"
  if (viewOptions) util.merge(options, viewOptions);

  // merge render() options
  if (opts) util.merge(options, opts);

  // merge render() .locals
  if (opts && opts.locals) util.merge(options, opts.locals);

  // capture attempts
  options.attempts = [];

  var layout = options.layout;

  // Layout support
  if (true === layout || undefined === layout) {
    if(this._layout) {
      layout = this._layout;
    } else {
      layout = 'layout';
    }
  }

  // Default execution scope to a plain object
  options.scope = options.scope || {};

  // Populate view
  options.parentView = parent;

  // "views" setting
  options.root = root;

  // "view engine" setting
  options.defaultEngine = app.set('view engine');

  // charset option
  if (options.charset) this.charset = options.charset;

  // Merge view helpers
  util.union(options, helpers);

  // View lookup
  options.hint = app.enabled('hints');
  view = express.view.compile(view, app.cache, cid, options);

  // layout helper
  options.layout = function(path){
    layout = path;
  };

  // render
  var str = view.fn.call(options.scope, options);

  // layout expected
  if (layout) {
    options.isLayout = true;
    options.layout = false;
    options.body = str;
    this.render(layout, options, fn, view, true);
  }  else if (fn) {
    fn(null, str);
  // respond
  } else {
    return str;
  }
};