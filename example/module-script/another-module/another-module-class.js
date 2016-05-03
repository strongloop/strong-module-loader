// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-module-loader
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = AnotherModuleClass;

function AnotherModuleClass(options) {
  this.options = options;
}

AnotherModuleClass.prototype.foo = function () {
  console.log('foo', this.options.msg);
}