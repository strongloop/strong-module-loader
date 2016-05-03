// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-module-loader
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var ml = require('../../').create('.');

ml.load(function () {
  console.log('module loaded...');
});