var ModuleLoader = require('../');
var moduleLoader = ModuleLoader.create('sample-app');

moduleLoader.registerType('my-module-type', require('./my-module-type'));
moduleLoader.registerType('module', function (options) {
  this.options = options;
});

moduleLoader.load(function (err, modules) {
  if(err) throw err;
  
  console.log('loaded modules...');
  
  moduleLoader.instanceOf('my-module-type').forEach(function (m) {
    m.speak();
  });
});