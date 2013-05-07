# module-loader
v0.0.1

## Purpose

Instantiate `objects` backed by vanilla JavaScript classes using config files. Your class constructors may declare `options` and `dependencies` that will validate provided configuration and inject instances of your dependencies.

 - This doesn't replace `require()`. Use this alongside `require()`.
 - This is not a plugin framework.
 - This is only for creating objects from config files.

## Install

    npm install slnode-configurable
    
## Example

Write a couple vanilla JavaScript classes.

**logger.js**
 
    var inherits = require('util').inherits
      , Module = require('slnode-configurable').Module;

    function Log(options) {
      // call super constructor
      Module.apply(this, arguments);
    }

    // inherit from Module
    inherits(Log, Module);

    // some options
    Log.options = {
      prefix: 'string'
    };

    // an instance method
    Log.prototype.write = function (msg) {
      console.log(this.options.prefix, msg);
    }
    
    // export it
    module.exports = Log;
    
**dog.js**
        
    var inherits = require('util').inherits
      , Module = require('slnode-configurable').Module;
        
    function Dog(options) {
      Module.apply(this, arguments);
      
      // the logger is built for us as a dependency
      this.logger = this.dependencies.logger;
    }
    
    Dog.options = {
      name: 'string'
    };
    
    Dog.dependencies = {
      logger: 'logger'
    };
  
    inherits(Dog, Module);
  
    Dog.prototype.speak = function() {
      this.logger.write('my name is' + this.options.name);
    }
    
    // export it
    module.exports = Dog;

**config.json**

    {
      // regular instance - `name` option is provided by default
      "fido": {
        "require": "./dog",
        // uses the global options
        "dependencies": {"logger": "logger"}
      },
      // regular instance
      "santas-little-helper": {
        "require": "./dog",
        // instance options
        "options": {"name": "slh"},
        "dependencies" {"logger": "logger"}
      },
      // regular instance
      "rex": {
        "require": "./dog",
        "dependencies": {"logger": "rex-logger"}
      },
      // global dep
      "logger": {
        "require": "./logger",
        "options": {"prefix": "roof!"}
      }
      // simple dep
      "rex-logger": {
        "require": "./logger",
        "options": {"prefix": "ROOF!"}
      }
    }

Load up the config (app.js):

    var builder = require('object-builder').create('my-app');

    builder.build(function (err, objects) {
      if(err) throw err;
  
      objects
        .instanceOf('dog') // module name / require() / Class name
        .forEach(function (dog) {
          dog.speak();
        });
    });
    

**Note:** if your config doesn't provide the described options (Dog.options) or dependencies (Dog.dependencies) `build()` will callback with an `err`.
    
The above calls `speak()` on all module instances that inherit from `Dog` and outputs:

    ~ my name is fido
    ... my name is slh
    ROOF! my name is rex

## Creating Classes

Your class should take meaningful input (options, dependencies) and create a useful output: an object with methods and properties.

### Classes

The `object-builder` does not have strong opinions on Classes. As far as it is concerned Classes are just vanilla JavaScript classes exported from a node module. Although if you want option validation and dependency injection your class must inherit from `ObjectBuilder.BaseObject`.

    var inherits = require('util').inherits;
    var Module = require('asteroid-module-loader').BaseObject;

    module.exports = Dog;

    function Dog(options) {
      this.options = options;
    }

    inherits(Dog, BaseObject);

    Dog.prototype.speak = function() {
      console.log('roof', 'my name is', this.options.name);
    }

Classes that inherit from `Module` may define dependency contracts that tell the loader to provide dependencies of a given class during construction.

    function MyComplexModule() {
      Module.apply(this, arguments);
      console.log('loaded dependencies', this.dependencies); // {'my-dependency': <module instance>}
    }

    MyComplexModule.dependencies = {
      'my-dependency': 'another-module'
    }

#### Class Options

Classes may also describe the options they accept. This will validate any provided configuration and guarantee the module class constructor has enough information to construct an instance.

Here is an example `options` description for a database connection class.

    DatabaseConnection.options = {
      hostname: {type: 'string', required: true},
      port: {type: 'number', min: 10, max: 99999},
      username: {type: 'string'},
      password: {type: 'string'}
    };

**key** the option name given in `config.json`.

**type** must be one of:

 - string
 - boolean
 - number
 - array

**min/max** depend on the option type

    {
      min: 10, // minimum length or value
      max: 100, // max length or value
    }

#### Class Events

Classes that inherit from `Module` may emit and listen to events. By default a `Module` will emit the following events:

**destroy**

Emitted when a module instance is being destroyed during a `moduleLoader.reset()`. Modules should cleanup any connections and unbind all event listeners when this is emitted.

### Configuration

Instances are constructed by creating a `config.json` file in a directory with a name to identify the instance.

    /my-module-instance
      config.json
      other-files.txt
      index.js
      
This directory should contain files related to the module instance. For example it might contain a script that `require()`s the module instance. 

#### config.require

Require the node module that exports a class to construct the config's object/instance.

    {
      "require": "my-module-class"
    }

#### config.options

Defines arbitrary options. A `file-upload` module might have an `uploads` option.

    {
      "module": "file-upload",
      "options": {
        "uploads": "/tmp"
      }
    }

#### config.dependencies

Defines other module instances the configured instance depends on.

    {
      "module": "collection"
      "dependencies": {
        "db": "my-db-module"
      },
      "options": {
        "collection-name": "my-collection"
      }
    }

Where `my-db-module`'s config looks like this:

    {
      "module": "couchdb-connector",
      "options": {
        "database": "my-db"
      }
    }
    
#### config.env.json

Separate file that overrides `config.json` depending on the current `NODE_ENV`. Useful for including config information that is environment specific or should not be committed to source control.

    {
      // overrides for all envs
      "*": {
        "options": {
          "upload-dir": "/uploads"
        }
      },
      "dev": {
        "options": {
          "upload-dir": "/dev-uploads"
        }
      }
    }

## Requiring Modules

To reference the built objects, you can `require()` them anywhere in your program like you normally would require any node module. For example, you can get a reference to the `fido` object like this:
    
    // `fido` is the directory name containing the fido module `config.json` file
    // or the name declared in the parent / global `config.json` file
    var fido = require('fido');
    
**Note:** you can only require objects once `build()` has been called and calls back without an error.

### Require Behavior

After your program runs `require('asteroid-module-loader')` the `require()` function's behavior will change slightly to make referencing instances the same as referencing regular node modules. Since instances are not bound to a physical file, they can't be `require()`d with `node`'s existing require() implementation.
    
## Config Loader

`asteroid-module-loader` inherits from [asteroid-config-loader](https://github.com/strongloop/asteroid-config-loader).

## Searching Paths

By default, the `asteroid-module-loader` searches the same paths that `require()` does. You can include additional paths in the search by adding directories to the `paths` array. This will not effect the paths exposed to `require()`.

    var builder = require('object-builder').create('my-app');
    
    builder.paths.push('/Users/me/my_node_modules');