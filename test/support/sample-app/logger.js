var inherits = require('util').inherits
  , Module = require('../../../').Module;

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