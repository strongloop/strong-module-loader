/**
 * Expose `Module`.
 */

module.exports = Module;

/**
 * Module dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , debug = require('debug')('module')
  , path = require('path')
  , util = require('util')
  , inherits = util.inherits
  , assert = require('assert');
  
/**
 * Create a new `Module` with the given `options`.
 *
 * @param {Object} options
 * @return {Module}
 */

function Module(options, dependencies) {
  EventEmitter.apply(this, arguments);
  
  this.options = options;
  
  if(dependencies) {
    this.dependencies = this._resolveDependencies(dependencies); 
  }
}

/**
 * Inherit from `EventEmitter`.
 */

inherits(Module, EventEmitter);

/**
 * Build dependencies from constructor description (MyCustomModule.dependencies) and dependencie
 * configuration (config.dependencies).
 */

Module.prototype._resolveDependencies = function (depsConfig) {
  var desc = this.constructor.dependencies;
  var types = {};
  var deps = {};
  var moduleLoader = this.options._moduleLoader;
  
  Object.keys(desc).forEach(function (depName) {
    var depInstanceName = depsConfig[depName];
    
    if(!depInstanceName) {
      throw new Error('Required dependency not defined: "' + depName + '"');
    }
    
    // load the described type
    try {
      var modPath = desc[depName];
      
      if(modPath[0] === '.') {
        modPath = path.resolve('.', path.dirname(this.options._path), desc[depName]);
      }
      
      types[depName] = require(modPath);
    } catch(e) {
      e.message = 'Failed to require dependency type "' + depName + ': ' + desc[depName] + '" for ' + this.options._path + '. ' + e.message;
      throw e;
    }
    
    var configAndPath = moduleLoader.getConfigAndPathByName(depInstanceName);
    var config = configAndPath && configAndPath.config;
    var configPath = configAndPath && configAndPath.path;
    
    if(config) {
      var m = moduleLoader.getByName(depInstanceName);
      
      if(!m) {
        // construct the module now
        m = moduleLoader.constructModuleFromConfigAtPath(config, configPath);
      }
      
      if(!types[depName]) {
        throw new Error(modPath + ' does not correctly export a constructor or does not exist.');
      }
      
      if(!(m instanceof types[depName])) {
        throw new Error('Dependency ' + depName + ' is not an instance of ' + types[depName].name);
      }
    } else {
      throw new Error('Could not find dependency "'+ depInstanceName +'" config while resolving dependencies for ' + this.options._path);
    }
  }.bind(this));
  
  return deps;
}