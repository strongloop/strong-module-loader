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
  this.isBuilt = false;
}

ObjectBuilder.prototype.build = function () {
  var Class = this.classLoader.load(this.require, this.dir);
  var exports = new Class(this.options, this.dependencies);
  
  this.isBuilt = true;
  
  var mod = this.module = new PatchedModule(this.dir, module);
  mod.exports = Class;
  mod.filename = this.dir;
  mod.loaded = true;
  
  // place in cache so other module can require it
  Module._cache[this.dir] = mod;
  
  return exports;
}

ObjectBuilder.prototype.main = function () {
  assert(this.isBuilt, 'cannot run the main script for an un-built object');
  
  var main = this.config.main;
  
  if(main) {
    
  }
}