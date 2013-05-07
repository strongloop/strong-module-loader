/**
 * Expose `ClassLoader`.
 */

module.exports = ClassLoader;

/**
 * Module dependencies.
 */
 
var debug = require('debug')('class-loader')
  , assert = require('assert')
  , Module = require('module');
  
/**
 * Create a new `ClassLoader` with the given `options`.
 *
 * @param {Object} options
 * @return {ClassLoader}
 */

function ClassLoader(objects) {
  this.objects = objects;
}

/**
 * Load a class from the given requireable path as if from the given `fromPath`.
 *
 * @param {String} path - require style path
 * @return {Function} exported class
 */
 
ClassLoader.prototype.loadClass = function (path) {
  var Class = this.loadModule(requirePath, fromPath);
  
  assert(typeof Class === 'function', requirePath + ' does not export a constructor');
  
  // allow the class to interact with other objects
  Class._objects = this.objects;
  
  return Class;
}

/**
 * Load a node module from the given requireable path as if from the given `fromPath`.
 *
 * @param {String} path - require style path
 * @param {String} root - path to require relative to
 * @return {Function} exported class
 */


ClassLoader.prototype.loadModule = function (path, root) {
  var exports;
  root = root || this.objects.root;
  
  return PatchedModule.loadModuleFromPath(path, root);
}