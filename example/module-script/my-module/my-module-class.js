// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-module-loader
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = MyModuleClass;

function MyModuleClass(options) {
  this.options = options;
}

MyModuleClass.prototype.hello = function () {
  console.log(this.options.msg);
}
