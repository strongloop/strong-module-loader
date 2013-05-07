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

function ObjectCollection(files, root, paths) {
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
  var classIndex = this.classIndex = {};
  var moduleIndex = this.moduleIndex = {};
  
  // index all configs (including nested)
  dirs
    .forEach(function (dir) {
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
  
  objects
    // build all objects
    .map(this.getBuiltObjectByName.bind(this))
    // run main scripts
    .forEach(function (obj) {
      if(obj.hasMain && !obj.ranMain) {
        obj.main();
      }
    });
}

ObjectCollection.prototype.byName = function (name) {
  return this.objectIndex[name];
}

ObjectCollection.prototype.getBuiltObjectByName = function (name) {
  var ob = this.byName(name);
  var typeIndex = this.classIndex;
  
  if(!ob.isBuilt) {
    var obj = ob.build();
    // index classes by constructor name and module name
    var Class = ob.class;
    classIndex[Class.name] = Class;
    classIndex[':' + ob.classModuleName] = Class;
  }
  
  return ob.exports;
}

/**
 * Destroy all objects.
 */

ObjectCollection.prototype.destroy = function () {
  this.objects
    .forEach(function (name) {
      var ob = this.objects[name];
      ob.destroy();
    }.bind(this));
}

/**
 * Return all objects whose constructors inherit from the given class or module name.
 */

ObjectCollection.prototype.instanceOf = function (name) {
  var Type = this.classIndex[':' + name] || this.classIndex[name];
  var collection = this;
  var results = [];
  
  this.objects
    .forEach(function (objName) {
      var obj = collection.byName(objName);
      var Class = obj.constructor;
    
      if(obj instanceof Class) {
        results.push(obj);
      }
    });
    
  return results;
}