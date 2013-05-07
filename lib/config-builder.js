/**
 * Expose `ModuleLoader`.
 */

module.exports = ModuleLoader;

/**
 * Module dependencies.
 */
 
var ConfigLoader = require('asteroid-config-loader')
  , PatchedModule = require('./patched-module')
  , fs = require('fs')
  , path = require('path')
  , debug = require('debug')('module-loader')
  , util = require('util')
  , inherits = util.inherits
  , assert = require('assert')
  , merge = require('deepmerge');
  
/**
 * Create a new `ModuleLoader` with the given `options`.
 *
 * @param {Object} options
 * @return {ModuleLoader}
 */

function ModuleLoader(options) {
  ConfigLoader.apply(this, arguments);
  
  this.root = options.root;
  this.options = options;
  this.paths = PatchedModule.extraPaths = [];
  
  debug('created with options', options);
}

/**
 * Inherit from `ConfigLoader`.
 */

inherits(ModuleLoader, ConfigLoader);

/**
 * Simplified APIs
 */

ModuleLoader.create =
ModuleLoader.createModuleLoader = function (root, options) {
  options = options || {};
  options.root = root;
  return new ModuleLoader(options);
}

/**
 * Load the configuration and build modules.
 */

ModuleLoader.prototype.build =
ModuleLoader.prototype.load = function (fn) {
  if(this.remaining()) {
    // wait until the current operation is finished
    this.once('done', function () {
      fn(null, this._files);
    });
    // callback with an error if it occurs
    this.once('error', fn);
  } else if(this.ttl() > 0) {
    fn(null, this.objects);
  } else {
    this.reset();
    
    this.once('error', fn);
    
    this.bindListeners();
    
    // load config files
    this.task(fs, 'readdir', this.root);
    this.once('done', function () {
      this._mergeEnvConfigs();
      // create instances from config
      this.objects = new ObjectCollection(configs, this.root);
      fn(null, this.objects);
    });
  }
}

/**
 * Load a class from the given module name.
 */

ModuleLoader.prototype.loadType = function (name) {
  var Type = PatchedModule.loadModuleFromPath(name, this.options.root);
  
  return Type;
}

/**
 * Reset the loaded modules and cache.
 */

ModuleLoader.prototype.reset = function () {
  // destroy all objects
  this.objects.destroy();
  
  ConfigLoader.prototype.reset.apply(this, arguments);
}

function clearObject(obj, fn) {
  Object.keys(obj).forEach(function (k) {
    if(fn) {
      fn(obj[k]);
    }
    
    delete obj[k];
  });
}
