// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-module-loader
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var MyModuleType = require('../my-module-type');
var util = require('util');

module.exports = HelloModule;

function HelloModule(options) {
  MyModuleType.call(this, options);
}

util.inherits(HelloModule, MyModuleType);

HelloModule.prototype.speak = function () {
  console.log('from hello module', this.options);
}