/*
  This module copies most of the view rendering portion of express, and piggy-backs on an existing express app in order to 
  render HTML views to be used for emails (or other purposes that do not require outputting to the browser)

  Usage:
  expressRender = require('express-render');
  expressRender.init(express, app);
  expressRender.render("template", {locals: {my: "local", vars: true}}, callback);


*/

module.exports = function() {

  this.util = require('./connect-utils');
  this.util = this.util.merge(util, require('./express-utils'));

  this.init = function(express, app) {
    this.express = express;
    this.app = app;
  }

  // Most of this function is copied directly from Express in order to replicate its res.render behavior
  this.render = function(view, opts, fn, parent, sub) {
    if(!this.express || !this.app) {
      var error = new Error('Module was not initialized. Intialize with init() before rendering.');
      if(fn) {
        fn(error);
      } else {
        throw error;
      }
    }
    var options = {}
    , util = this.util
    , self = this.express
    , app = this.app
    , helpers = app._locals
    , dynamicHelpers = app.dynamicViewHelpers
    , viewOptions = app.set('view options')
    , root = app.set('views') || process.cwd() + '/views';

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
      layout = 'layout';
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

    // Dynamic helper support
    if (false !== options.dynamicHelpers) {
      // cache
      if (!this.__dynamicHelpers) {
        this.__dynamicHelpers = {};
        for (var key in dynamicHelpers) {
          this.__dynamicHelpers[key] = dynamicHelpers[key].call(
              this.app
            , this.req
            , this);
        }
      }

      // apply
      util.merge(options, this.__dynamicHelpers);
    }

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
}