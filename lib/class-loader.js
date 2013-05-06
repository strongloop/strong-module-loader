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
 * @param {String} requirePath
 * @param {String} fromPath
 * @return {Function} exported class
 */
 
ClassLoader.prototype.loadClass = function (requirePath, fromPath) {
  var Class = this.loadModule(requirePath, fromPath);
  
  assert(typeof Class === 'function', requirePath + ' does not export a constructor');
  
  // allow the class to interact with other objects
  Class._objects = this.objects;
  
  return Class;
}

/**
 * Load a node module from the given requireable path as if from the given `fromPath`.
 *
 * @param {String} requirePath
 * @param {String} fromPath
 * @return {Function} exported class
 */

ClassLoader.prototype.loadModule = function (requirePath, fromPath) {
  var exports;
  var root = this.objects.root;

  // pointing to a relative file
  if(requirePath[0] === '.') {
    assert(fromPath, 'a fromPath path was not supplied when requring a class relatively');
    requirePath = path.resolve(fromPath, requirePath);
  }
  
  // use the root as the base dir for loading
  var paths = PatchedModule.resolveLookupPaths(root)[1];
  
  // load the module
  return PatchedModule.load(PatchedModule.resolveFilename(alias, {paths: paths}));
}