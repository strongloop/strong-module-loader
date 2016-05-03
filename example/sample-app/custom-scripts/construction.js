// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-module-loader
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

/**
 * not yet supported...
 */

var modules = require('modules');
var currentModule = modules(__dirname);

console.log('this script is executed after a module is constructed');
console.log('currentModule', currentModule);