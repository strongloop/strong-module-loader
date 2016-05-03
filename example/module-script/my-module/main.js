// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-module-loader
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var myModule = require('./');

myModule.hello(); // hello world (via config.json's options.msg)

var anotherModule = require('../another-module');

anotherModule.foo();