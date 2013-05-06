/**
 * Expose `BaseObject`.
 */

module.exports = BaseObject;

/**
 * BaseObject dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , debug = require('debug')('module')
  , path = require('path')
  , util = require('util')
  , inherits = util.inherits
  , assert = require('assert');
  
/**
 * Create a new `BaseObject` with the given `options`.
 *
 * @param {Object} options
 * @return {BaseObject}
 */

function BaseObject(options, dependencies) {
  dependencies = dependencies || {};
  
  debug('constructing %s', this.constructor.name);
  
  EventEmitter.apply(this, arguments);
  
  this.options = options;
  
  if(this.constructor.dependencies) {
    assert(typeof this.constructor.dependencies === 'object', this.constructor.name 
                         + '.dependencies does not allow any dependencies!');

    // merge dependencies for inheritence chain
    var constructor = this.constructor;
    var mergedDeps = {};

    while(constructor) {
      var deps = constructor.dependencies;
      
      if(deps) {
        Object.keys(deps).forEach(function (key) {
          if(!mergedDeps[key]) mergedDeps[key] = deps[key];
        });
      }
      
      // move up the inheritence chain
      constructor = constructor.super_;
    }
    
    this.dependencies = this._resolveDependencies(dependencies, mergedDeps); 
  }
  
  if(this.constructor.options) {
    assert(typeof this.constructor.options === 'object', this.constructor.name 
                         + '.options must be an object!');
                         
    // merge options for inheritence chain
    var constructor = this.constructor;
    var mergedOpts = {};

    while(constructor) {
     var opts = constructor.options;

     if(opts) {
       Object.keys(opts).forEach(function (key) {
         if(!mergedOpts[key]) mergedOpts[key] = opts[key];
       });
     }

     // move up the inheritence chain
     constructor = constructor.super_;
    }
    
    validateOptions(options, mergedOpts);
  }
}

/**
 * Inherit from `EventEmitter`.
 */

inherits(BaseObject, EventEmitter);

/**
 * Build dependencies from constructor description (MyCustomBaseObject.dependencies) and dependencie
 * configuration (config.dependencies).
 */

BaseObject.prototype._resolveDependencies = function (depsConfig, desc) {
  var deps = {};
  
  // iterate the class description of dependencies
  Object.keys(desc).forEach(function (depName) {
    var depRequired = true;
    
    if(typeof desc[depName] === 'object' && desc[depName].optional) {
      depRequired = false;
    }
    
    var depInstanceName = depsConfig[depName];
    
    if(!depInstanceName) {
      if(depRequired) {
        throw new Error('Required dependency not defined: "' + depName + '"');
      } else {
        // don't load the optional dep
        return;
      }
    }

    // constructor._objects is a property added by the ClassLoader
    var obj = this.constructor._objects.byName(depInstanceName);

    if(obj) {
      deps[depName] = obj;
    } else {    
      throw new Error('Could not find dependency "'+ depInstanceName +'" while resolving dependencies for ' + this.options.name);
    }
  }.bind(this));
  
  return deps;
}

BaseObject.prototype.destroy = function () {
  this.emit('destroy');
}

function validateOptions(options, def) {
  if(!def) {
    return options;
  }
  
  Object.keys(def).forEach(function (key) {
    var val = options[key];
    var keyDef = def[key] || {};
    
    if(keyDef.required) {
      assert(val, key + ' is required!');
    }
    
    if(typeof val === 'undefined') {
      // stop validation if a value
      // wasnt provided
      return;
    }
    
    if(keyDef.type === 'array') {
      assert(Array.isArray(val), key + ' must be a ' + keyDef.type)
    } else {
      // type
      assert(typeof val == keyDef.type, key + ' must be a ' + keyDef.type);
    }
    
    // size / length
    if(typeof val.length === 'number') {
      if(keyDef.min) {
        assert(val.length >= keyDef.min, key + ' length must be greater than or equal to ', keyDef.min);
      }
      if(keyDef.max) {
        assert(val.length <= keyDef.min, key + ' length must be less than or equal to ', keyDef.max);
      }
    } else if(typeof val === 'number') {
      if(keyDef.min) {
        assert(val >= keyDef.min, key + ' must be greater than or equal to ', keyDef.min);        
      }
      if(keyDef.max) {
        assert(val <= keyDef.max, ' must be less than or equal to ', keyDef.max);
      }
    }
  });
}