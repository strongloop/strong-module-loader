/**
 * Expose `ObjectCollection`.
 */

module.exports = ObjectCollection;

/**
 * Module dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , debug = require('debug')('object-collection')
  , util = require('util')
  , inherits = util.inherits
  , assert = require('assert')
  , ObjectBuilder = require('./object-builder')
  , PatchedModule = require('./patched-module')
  , path = require('path');
  
/**
 * Create a new `ObjectCollection` with the given `options`.
 *
 * @param {Object} options
 * @return {ObjectCollection}
 */

function ObjectCollection(files, root) {
  var dirIndex = this.dirIndex = {};
  this.dirs = Object.keys(files).files.map(function (file) {
    var dir = path.dirname(file);
    dirIndex[dir] = files[file];
    return dir;
  });
  this.root = root;
  this._build(dirs, dirIndex);
  this.names = Object.keys(this.objects);
}

/*!
 * Build an index of objects by name and directory.
 */

ObjectCollection.prototype._build = function (dirs, dirIndex) {
  var objects = this;
  var reserved = ['options', 'dependencies', 'module', 'require'];
  var objectIndex = this.objectIndex = {};
  var objectDirIndex = this.objectDirIndex = {};
  
  // index all configs (including nested)
  dirs.forEach(function (dir) {
      var config = dirIndex[dir];
      
      Object
        .keys(config)
        .forEach(function (key) {
          if(~reserved.indexOf(key)) {
            // reserved config
          } else {
            // add nested configs as faux dirs
            var fauxDir = path.join(dir, key);
            dirIndex[fauxDir] = config[key];
            dirs.push(fauxDir);
          }
        });
      
      var parent = index[path.dirname(dir)];
      var ob = new ObjectBuilder(dir, config, objects, parent);
      
      // index by name and dir separately
      objectDirIndex[dir] = objectIndex[path.basename(dir)] = ob;
    });
    
  var objects = this.objects = Object.keys(objectIndex);
  
  // build objects
  objects.forEach(this.getBuiltObjectByName.bind(this));
}

ObjectCollection.prototype.byName = function (name) {
  return this.objectIndex[name];
}

ObjectCollection.prototype.getBuiltObjectByName = function (name) {
  var ob = this.byName(name);
  if(!ob.isBuilt) {
    return ob.build();
  }
  
  return ob.exports;
}

ObjectCollection.prototype.loadModule = function (requirePath, fromPath) {
  var exports;
  var root = this.root;

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
