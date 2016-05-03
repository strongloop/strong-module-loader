// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-module-loader
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var ModuleLoader = require('../../');
var moduleLoader = ModuleLoader.create('.');

moduleLoader.load(function (err, modules) {
  if(err) throw err;
  
  console.log('loaded modules...');
  
  moduleLoader.instanceOf('MyModuleType').forEach(function (m) {
    m.speak();
  });
});