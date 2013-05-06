var ModuleLoader = require('../');
var path = require('path');
var SAMPLE_APP = path.join(__dirname, 'support', 'sample-app');


describe('ModuleLoader', function(){
  var objects;
  
  beforeEach(function(){
    objects = ModuleLoader.create(SAMPLE_APP);
  });
  
  describe('.build(fn)', function(){
    it('should build a set of objects', function(done) {
      objects.build(done);
    });
  });
  
  describe('.instanceOf(type)', function(){
    it('should return an array of objects', function(done) {
      objects.build(function (err) {
        if(err) throw err;
        
        var dogs = objects.instanceOf('dog');
        
        assert(Array.isArray(dogs));
      });
    });
  });
});