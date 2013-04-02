/**
 * Expose `ModuleLoader`.
 */

module.exports = ModuleLoader;

/**
 * Module dependencies.
 */
 
var ConfigLoader = require('config-loader')
  , fs = require('fs')
  , path = require('path')
  , debug = require('debug')('module-loader')
  , util = require('util')
  , inherits = util.inherits
  , assert = require('assert');
  
/**
 * Create a new `ModuleLoader` with the given `options`.
 *
 * @param {Object} options
 * @return {ModuleLoader}
 */

function ModuleLoader(options) {
  ConfigLoader.apply(this, arguments);
  
  this.types = {};
  this._modules = {};
  
  // throw an error if args are not supplied
  // assert(typeof options === 'object', 'ModuleLoader requires an options object');
  
  this.options = options;
  
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
  options.filename = 'config.json';

  return new ModuleLoader(options);
}

/**
 * Load the configuration and build modules.
 */
 
ModuleLoader.prototype.load = function (fn) {
  if(this.ttl() > 0) {
    fn(null, this._modules);
  } else {
    this.on('error', fn);
    this.reset();
    // load config files
    this.task(fs, 'readdir', this.root);
    this.on('done', function () {
      // create instances from config
      this._constructModules(this._files);
      fn(null, this._modules);
    });
  }
}

/**
 * Build modules from a list of config files.
 */

ModuleLoader.prototype._constructModules = function (configs) {
  Object.keys(configs).forEach(function (p) {
    var Type = this.getTypeFromConfig(configs[p], p);
    if(Type) {
      this._modules[p] = new Type(configs[p].options);
    }
  }.bind(this));
}

ModuleLoader.prototype.getTypeFromConfig = function (config, configPath) {
  var types = Object.keys(this.types);
  var Type;
  var typeName;
  
  for (var i=0; i < types.length; i++) {
    typeName = config[types[i]];
    
    if(typeName) break;
  }
  
  if(!typeName) {
    console.warn('skipped loading', configPath);
    console.warn('reason:', 'must provide a typeName (eg. "module": "my-module")');
    return;
  }
  
  // pointing to a relative type file
  if(typeName[0] === '.') {
    try {
      Type = require(path.join(process.cwd(), path.dirname(configPath), typeName));
    } catch(e) {
      console.error('failed to load module at', configPath);
      this.emit('error', e);
    }
  } else {
    // pointing to an available type
    Type = this.types[typeName];
  }
  
  if(Type) {
    return Type;
  }
}

/**
 * Register a type.
 *
 * @param {String} name
 * @param {Function} type constructor
 * @return {ModuleLoader} for chaining
 */

ModuleLoader.prototype.registerType = function (name, constructor) {
  this.types[name] = constructor;
}

/**
 * Return all module instances that inherit from the given type.
 */

ModuleLoader.prototype.instanceOf = function (typeName) {
  var Type = this.types[typeName];
  var results = [];
  
  if(!Type) {
    throw new Error(typeName + ' is not a registered type');
  }
  
  Object.keys(this._modules).forEach(function (k) {
    if(this._modules[k] instanceof Type) {
      results.push(this._modules[k]);
    }
  }.bind(this));
  
  return results;
}