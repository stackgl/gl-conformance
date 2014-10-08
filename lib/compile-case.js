'use strict'

module.exports = generateShell

var beautify = require('js-beautify')
var fs       = require('fs')
var path     = require('path')

var RESOURCES = require('./resources.json')

Object.keys(RESOURCES).forEach(function(resName) {
  var resource = RESOURCES[resName]
  var resPath = path.join(__dirname, resource.path)
  console.log(resPath)
  resource.file = fs.readFileSync(resPath).toString()
})


function generateShell(data) {
  console.log('compiling', data.caseName)

  var jsCaseName = data.caseName.replace(/\-/g, '_')

  var code = [
    'var _windowShim=require("../lib/shims/window-shim");',
    'var _documentShim=require("../lib/shims/document-shim");',
    'var _RESOURCES=require("./resources.json");',
    'function ', jsCaseName, '(ENVIRONMENT){',
      'ENVIRONMENT.document=_documentShim(ENVIRONMENT);',
      'ENVIRONMENT.window=_windowShim(ENVIRONMENT);',
      'ENVIRONMENT.scriptList=', JSON.stringify(data.shaders), ';',
      'ENVIRONMENT.canvasList=', JSON.stringify(data.canvas), ';',
      'ENVIRONMENT.RESOURCES=_RESOURCES;',
      'var document=ENVIRONMENT.document;',
      'var window=ENVIRONMENT.window;' ];

  for(var i=0; i<data.links.length; ++i) {
    var link = data.links[i]
    var resource = RESOURCES[link]
    if(!resource) {
      console.warn('skipping case:', data.name, ' - unknown module: ', link)
      return null
    }
    code.push(';', resource.file, ';')
  }

  code.push('\n\n\n/******************* BEGIN TEST CASE *******************/\n\n\n\n')

  for(var i=0; i<data.scripts.length; ++i) {
    code.push(data.scripts[i], ';')
  }

  code.push('\n\n\n/******************* END TEST CASE *******************/\n\n\n\n')

  if(data.onLoad) {
    code.push(';', data.onLoad, ';')
  }

  code.push(
      'if(ENVIRONMENT.postHook){',
        'ENVIRONMENT.postHook();',
      '}',
  '};module.exports=', jsCaseName)

  return beautify(code.join(''))
}