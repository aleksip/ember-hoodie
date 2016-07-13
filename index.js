/* jshint node:true */
'use strict';

var getHoodieServer = require('hoodie');
var url = require('url');
var path = require('path');
var proxy = require('http-proxy-middleware');

var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

var hoodie_options = {
  port: 4201
}

function hoodieMiddleware(config) {
  config.app.use('/hoodie', proxy({target: 'http://localhost:' + hoodie_options.port}));

  getHoodieServer(hoodie_options, function (error, server, config) {
    if (error) {
      var stack = new Error().stack.split('\n').slice(2).join('\n')
      return console.log('app', 'Failed to initialise:\n' + stack, error)
    }

    console.log('app', 'Starting')

    server.start(function () {
      console.log('Your Hoodie server has started on ' + url.format(config.connection))
    })
  })
}

module.exports = {
  name: 'ember-hoodie',

  // ember-browserify has the drawback that apps using ember-hoodie would be
  // required to install ember-browserify as well.
  // https://github.com/ef4/ember-browserify#using-ember-browserify-in-addons
  treeForVendor(tree) {
    var hoodiePackage = path.dirname(require.resolve('@hoodie/client'));
    var hoodieTree = new Funnel(this.treeGenerator(hoodiePackage), {
      srcDir: 'dist',
      destDir: '/'
    });
    if (tree) {
      return mergeTrees([tree, hoodieTree]);
    } else {
      return hoodieTree;
    }
  },

  included(app) {
    this._super.apply(this, arguments)

    app.import('vendor/hoodie.js');
  },

  serverMiddleware: hoodieMiddleware
};
