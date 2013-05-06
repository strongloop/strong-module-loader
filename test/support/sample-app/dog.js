var inherits = require('util').inherits
  , path = require('path')
  , Module = require('../../../').Module;
    
function Dog(options) {
  Module.apply(this, arguments);
  
  // the logger is built for us as a dependency
  this.logger = this.dependencies.logger;
}

Dog.options = {
  name: 'string'
};

Dog.dependencies = {
  logger: path.join(__dirname, 'logger')
};

inherits(Dog, Module);

Dog.prototype.speak = function() {
  this.logger.write('my name is' + this.options.name);
}

// export it
module.exports = Dog;