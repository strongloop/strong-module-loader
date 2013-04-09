var Module = require('../lib/module.js');
var inherits = require('util').inherits;

describe('Module', function(){
  var module;
  
  beforeEach(function(){
    module = new Module;
  });
  
  it('should merge all dependency objects', function() {
    function FooModule() {
      Module.apply(this, arguments);
    }
      
    inherits(FooModule, Module);
    
    FooModule.dependencies = {
      'foo': 'foo',
      'baz': 'baz'
    }
      
    function BarModule() {
      FooModule.apply(this, arguments);
    }
    
    inherits(BarModule, FooModule);
    
    BarModule.dependencies = {
      'foo': 'complex-foo',
      'bar': 'bar'
    };
    
    var called = false;
    
    BarModule.prototype._resolveDependencies = function (deps) {
      assert(deps.foo == 'complex-foo');
      assert(deps.bar == 'bar');
      assert(deps.baz == 'baz');
      called = true;
    }
    
    var bar = new BarModule({}, {});
    
    assert(called);
  });
  
});