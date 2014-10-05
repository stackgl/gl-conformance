'use strict'

module.exports = parseTestCase

var trumpet = require('trumpet')
var fs      = require('fs')
var path    = require('path')
var concat  = require('concat-stream')

var JSTYPES = [ 
  'text/javascript', 
  'application/javascript', 
  'application/x-javascript']

function parseTestCase(file, cb) {
  var tr          = trumpet()
  var srcTags     = []
  var scriptTags  = []
  var canvases    = []
  var shaders     = {}

  var dirname = path.dirname(file)
  var confDir = path.join(__dirname, '../conformance-suites/1.0.2/conformance')
  var root    = path.resolve(confDir)

  tr.selectAll('script', function(elem) {
    var src = elem.getAttribute('src')
    if(src) {
      var relpath = path.relative(root, path.resolve(path.join(dirname, src)))
      srcTags.push(relpath)
    } else {
      var type = elem.getAttribute('type') || elem.getAttribute('language')
      if(type && JSTYPES.indexOf(type) < 0) {
        var id = elem.getAttribute('id') || type
        elem.createReadStream().pipe(concat(function(body) {
          shaders[id] = {
            type: type,
            text: body.toString()
          }
        }))
      } else {
        elem.createReadStream().pipe(concat(function(body) {
          scriptTags.push(body.toString())
        }))
      }
    }
  })

  tr.selectAll('canvas', function(elem) {
    //Save canvas
    canvases.push({
      id: elem.getAttribute('id'),
      width: elem.getAttribute('width'),
      height: elem.getAttribute('height')
    })
  })

  tr.on('end', function() {
    var caseName = path.relative(confDir, file)
    caseName = caseName.replace(/\/|\\/g,'_').replace('.html', '')
    cb(null, {
      caseName: caseName,
      name: file,
      directory: path.dirname(file),
      links: srcTags,
      scripts: scriptTags,
      shaders: shaders,
      canvas: canvases
    })
  })

  tr.on('error', function(err) {
    cb(err, null)
  })

  fs.createReadStream(file).pipe(tr)
}