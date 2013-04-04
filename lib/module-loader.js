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
 * Reset the loaded modules an their cache.
 */

ModuleLoader.prototype.reset = function () {
  clearRequireCache();
  
  ConfigLoader.prototype.reset.apply(this, arguments);
}

/**
 * Build modules from a list of config files.
 */

ModuleLoader.prototype._constructModules = function (configs) {
  Object.keys(configs).forEach(function (p) {
    this.constructModuleFromConfigAtPath(configs[p], p);
  }.bind(this));
}

ModuleLoader.prototype.constructModuleFromConfigAtPath = function (config, p) {
  config.options = config.options || {};
  config.options._moduleLoader = this;
  config.options._name = path.basename(path.dirname(p));
  
  var Type = this.getTypeFromConfig(config, p);
  if(Type) {
    // private options
    config.options._path = p;
    var m = this._modules[p] = new Type(config.options, config.dependencies);
    return m;
  }
}

/**
 * Return a module with the provided name.
 */

ModuleLoader.prototype.getByName = function (name) {
  var paths = Object.keys(this._modules);
  
  for (var i = 0; i < paths.length; i++) {
    var n = path.basename(path.dirname(paths[i]));
      
    if(n === name) {
      return this._modules[paths[i]];
    }
  }
}

/**
 * Get a module config by module name.
 */

ModuleLoader.prototype.getConfigAndPathByName = function (name) {
  var paths = Object.keys(this._files);
  
  for (var i = 0; i < paths.length; i++) {
    if(path.basename(path.dirname(paths[i])) === name) {
      return {config: this._files[paths[i]], path: paths[i]};
    }
  }
}

ModuleLoader.prototype.getTypeFromConfig = function (config, configPath) {
  var ml = this;
  var Type;
  var typeName = config.module;
  
  // pointing to a relative type file
  if(typeName[0] === '.') {
    try {
      Type = require(path.join(process.cwd(), path.dirname(configPath), typeName));
    } catch(e) {
      fail(e);
    }
  } else {
    // pointing to a module
    try {
      // load from the programs main module
      Type = require('module')._load(typeName, process.mainModule);
    } catch(e) {
      fail(e);
    }
  }
  
  if(Type) {
    return Type;
  }
  
  function fail(e) {
    console.error('failed to load module at', configPath, typeName);
    ml.emit('error', e);
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

function clearRequireCache() {
  Object.keys(require.cache).forEach(function (k) {
    delete require.cache[k];
  });
}