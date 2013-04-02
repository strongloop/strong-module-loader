# module-loader
v0.0.1

## Purpose

The `module-loader` allows your program to register classes (or types) that are instantiated via configuration files. Configuration files point to an implementation `module` constructor. The `module`'s job is to construct a useful instance with the given configuration options. This allows programs to be free from bootstrapping code and manageable via config.

## Install

    slnode install module-loader
    
## Example

Given a simple `Dog` class/type:

    function Dog(options) {
      this.options = options;
    }
  
    Dog.prototype.speak = function() {
      console.log('roof', 'my name is', this.options.name);
    }

And a set of `config.json` files:

    /my-app
      /fido
        config.json
      /santas-little-helper
        config.json
      /rex
        config.json

Where a `config.json` looks something like this:

    {
      "dog": "dog" // or "dog": "my-custom-dog-class"
      "options": {
        "name": "fido"
      }
    }

We can load up all the dogs like so:

    var moduleLoader = require('module-loader').create('my-app');
    moduleLoader.registerType('dog', Dog);

    moduleLoader.load(function (err, modules) {
      if(err) throw err;
  
      moduleLoader
        .instanceOf('dog')
        .forEach(function (m) {
          m.speak();
        });
    });
    
The above calls a method on all module instances that inherit from `Dog` and outputs:

    roof my name is fido
    roof my name is santa's little helper
    roof my name is rex

    
## Config Loader

`module-loader` inherits from [config-loader](https://github.com/strongloop/config-loader).
