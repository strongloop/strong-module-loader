/**
 * Expose `ObjectBuilder`.
 */

module.exports = ObjectBuilder;

/**
 * Module dependencies.
 */
 
var debug = require('debug')('object-builder')
  , ClassLoader = require('./class-loader')
  , Module = require('module')
  , assert = require('assert');
  
/**
 * Create a new `ObjectBuilder` with the given `options`.
 *
 * @param {Object} options
 * @return {ObjectBuilder}
 */

function ObjectBuilder(dir, config, objects, parent) {
  assert(dir, 'cannot create an object builder without a dir');
  assert(config, 'cannot create an object builder without a config');
  assert(objects, 'cannot create an object builder without objects');
  
  this.dir = dir;
  this.config = config;
  this.require = config.module || config.require;
  this.dependencies = config.dependencies || {};
  this.options = config.options || {};
  this.objects = objects;
  this.classLoader = new ClassLoader(objects);
  this.parent = parent;
  
  // TODO
  // - inherit parent options
  // - prefill deps from parent dir?
  // - parent 
  
  this.isBuilt = false;
  this.hasMain = !!config.main;
  this.ranMain = false;
}

ObjectBuilder.prototype.build = function () {
  var resolvedPath = this.require;
  
  // relative path
  if(resolvedPath[0] === '.') {
    resolvedPath = path.join(this.dir, resolvedPath);
  }
  
  var Class = this.classLoader.load(resolvedPath, this.dir);
  var exports = new Class(this.options, this.dependencies);
  
  this.isBuilt = true;
  this.class = Class;

  // get the module name from the provided path
  var moduleName = path.basename(resolvedPath);
  moduleName = moduleName.replace(path.extname(moduleName), '');
  this.classModuleName = moduleName;
  
  var mod = this.module = new PatchedModule(this.dir, module);
  mod.exports = exports;
  mod.filename = this.dir;
  mod.loaded = true;
  
  // place in cache so other module can require it
  Module._cache[this.dir] = mod;
  
  return this.exports = exports;
}

ObjectBuilder.prototype.main = function () {
  assert(this.hasMain, 'cannot run the main script for an object that does not specify one');
  assert(this.isBuilt, 'cannot run the main script for an un-built object');
  
  var main = this.config.main;
  
  if(main) {
    // require the main module
    this.classLoader.loadModule(main, this.dir);
    this.ranMain = true;
  }
}

ObjectBuilder.prototype.destroy = function () {
  var obj = this.exports;
  
  if(obj && typeof obj.destroy === 'function') {
    obj.destroy();
  }
  
  // remove from cache
  delete Module._cache[this.dir];
  if(this.hasMain) {
    // remove main from cache
    delete Module._cache[path.join(this.dir, this.config.main)];
  }
}