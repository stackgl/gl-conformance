'use strict'

module.exports = generateShell

var beautify = require('js-beautify')
var fs = require('fs')
var path = require('path')

var RESOURCES = require('./shims.json')

Object.keys(RESOURCES).forEach(function (resName) {
  var resource = RESOURCES[resName]
  var resPath = path.join(__dirname, resource.path)
  console.log(resPath)
  resource.file = fs.readFileSync(resPath).toString()
})

function generateShell (suiteDir, data) {
  console.log('compiling', data.caseName)

  var jsCaseName = data.caseName.replace(/\-|\./g, '_')

  var code = [
    '/*eslint-disable */',
    'var _windowShim=require("../lib/shims/window-shim");',
    'var _documentShim=require("../lib/shims/document-shim");',
    'var _canvasShim=require("../lib/shims/canvas-shim");',
    'var _imageShim=require("../lib/shims/image-shim");',
    'var _rafShim=require("../lib/shims/raf-shim");',
    'var _RESOURCES=require("./resources.json");',
    'function ', jsCaseName, '(ENVIRONMENT){',
    'var HTMLElement=function(){};',
    'ENVIRONMENT.CONTEXT_LIST=[];',
    'ENVIRONMENT.tape.end=(function(tape_end){return function(){_rafShim.clear();ENVIRONMENT.CONTEXT_LIST.forEach(function(gl) { (gl.destroy && gl.destroy()); }); ENVIRONMENT.CONTEXT_LIST = [];tape_end.call(ENVIRONMENT.tape);}})(ENVIRONMENT.tape.end);',
    'ENVIRONMENT._createContext=ENVIRONMENT.createContext;',
    'ENVIRONMENT.createContext=function(w,h,o){var gl=ENVIRONMENT._createContext(w,h,o);ENVIRONMENT.CONTEXT_LIST.push(gl);return gl;};',
    'ENVIRONMENT.document=_documentShim(ENVIRONMENT);',
    'ENVIRONMENT.window=_windowShim(ENVIRONMENT);',
    'ENVIRONMENT.scriptList=', JSON.stringify(data.shaders), ';',
    'ENVIRONMENT.canvasList=', JSON.stringify(data.canvas), '.map(function(opts){return _canvasShim(ENVIRONMENT,opts);});',
    'ENVIRONMENT.RESOURCES=_RESOURCES;',
    'ENVIRONMENT.BASEPATH="', path.relative(suiteDir, data.directory).replace(/\\/g, '/'), '";',
    'var document=ENVIRONMENT.document;',
    'var window=ENVIRONMENT.window;',
    'var Image=_imageShim;',
    'var requestAnimationFrame=_rafShim.requestAnimationFrame;',
    'var cancelAnimationFrame=_rafShim.cancelAnimationFrame;'
  ]

  for (var i = 0; i < data.links.length; ++i) {
    var link = data.links[i]
    var resource = RESOURCES[link]
    if (!resource) {
      console.warn('skipping case:', data.name, ' - unknown module: ', link)
      return null
    }
    code.push(';', resource.file, ';')
  }

  code.push('\n\n\n/******************* BEGIN TEST CASE *******************/\n\n\n\n')

  for (i = 0; i < data.scripts.length; ++i) {
    code.push(data.scripts[i], ';')
  }

  code.push('\n\n\n/******************* END TEST CASE *******************/\n\n\n\n')

  if (data.onLoad) {
    code.push(';', data.onLoad, ';')
  }

  code.push(
    'if(ENVIRONMENT.postHook){',
    'ENVIRONMENT.postHook();',
    '}',
    '};module.exports=', jsCaseName)

  return beautify(code.join(''))
}
