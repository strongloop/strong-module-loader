// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-module-loader
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = MyModuleType;

function MyModuleType(options) {
  this.options = options;
}

MyModuleType.prototype.speak = function () {
  console.log(this.options.msg || 'no message provided...');
}