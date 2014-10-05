'use strict'

module.exports = generateShell

var beautify = require('js-beautify')

var RESOURCE_NAMES = require('./resources.json')

function generateShell(data) {
  var code = [
    'var _windowShim=require("../lib/shims/window-shim");',
    'var _documentShim=require("../lib/shims/document-shim");'
  ]

  //First generate requires
  for(var i=0; i<data.links.length; ++i) {
    var link = data.links[i]
    var mod = RESOURCE_NAMES[link]
    if(!mod) {
      console.warn('skipping case:', data.name, ' - unknown module: ', link)
      return null
    }
    code.push('var _', mod.name, '=require("', mod.module, '");')
  }

  //Next generate module
  code.push('function setupEnvironment(ENVIRONMENT){',
    'ENVIRONMENT.document=_documentShim(ENVIRONMENT);',
    'ENVIRONMENT.window=_windowShim(ENVIRONMENT);',
    'ENVIRONMENT.scriptList=', JSON.stringify(data.shaders), ';',
    'ENVIRONMENT.canvasList=', JSON.stringify(data.canvas), ';')

  for(var i=0; i<data.links.length; ++i) {
    var link = data.links[i]
    var mod = RESOURCE_NAMES[link]
    code.push('ENVIRONMENT.', mod.name, '=_', mod.name, '(ENVIRONMENT);')
  }

  code.push('function runTest(){var window=ENVIRONMENT.window;var document=ENVIRONMENT.document;')

  for(var i=0; i<data.links.length; ++i) {
    var link = data.links[i]
    var mod = RESOURCE_NAMES[link]
    for(var j=0; j<mod.exports.length; ++j) {
      code.push('var ', mod.exports[j], '=ENVIRONMENT.', mod.name, '.', mod.exports[j], ';')
    }
  }

  for(var i=0; i<data.scripts.length; ++i) {
    code.push(data.scripts[i], ';')
  }

  code.push('if(ENVIRONMENT.postHook){ENVIRONMENT.postHook();};')

  code.push('};runTest();};module.exports=setupEnvironment;')

  return beautify(code.join(''))
}