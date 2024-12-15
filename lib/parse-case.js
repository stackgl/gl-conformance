'use strict'

module.exports = parseTestCase

var trumpet = require('trumpet')
var fs = require('fs')
var path = require('path')
var concat = require('concat-stream')
var eos = require('end-of-stream')

var JSTYPES = [
  'text/javascript',
  'application/javascript',
  'application/x-javascript']

function parseTestCase (VERSION, file, cb) {
  var tr = trumpet()
  var srcTags = []
  var scriptTags = []
  var canvases = []
  var shaders = {}
  var onLoad = ''

  var dirname = path.dirname(file)
  var confDir = path.join(__dirname, '../conformance-suites', VERSION, 'conformance')
  var root = path.resolve(confDir)
  var caseName = path.relative(confDir, file)
  caseName = caseName.replace(/\/|\\/g, '_').replace('.html', '')

  console.log('parsing case', caseName)

  tr.selectAll('script', function (elem) {
    var src = elem.getAttribute('src')
    if (src) {
      var relpath = path.relative(root, path.resolve(path.join(dirname, src))).replace(/\\/g, '/')
      srcTags.push(relpath)
    } else {
      var type = elem.getAttribute('type') || elem.getAttribute('language')
      if (type && JSTYPES.indexOf(type) < 0) {
        var id = elem.getAttribute('id') || type
        elem.createReadStream().pipe(concat(function (body) {
          shaders[id] = {
            type: type,
            text: body.toString()
          }
        }))
      } else {
        elem.createReadStream().pipe(concat(function (body) {
          scriptTags.push(body.toString())
        }))
      }
    }
  })

  tr.selectAll('canvas', function (elem) {
    canvases.push({
      id: elem.getAttribute('id'),
      width: elem.getAttribute('width'),
      height: elem.getAttribute('height')
    })
  })

  tr.selectAll('body', function (elem) {
    onLoad = elem.getAttribute('onload')
  })

  eos(tr, function (err) {
    if (err) {
      cb(err, null)
      return
    }
    cb(null, {
      caseName: caseName,
      name: file,
      directory: path.dirname(file),
      links: srcTags,
      scripts: scriptTags,
      shaders: shaders,
      canvas: canvases,
      onLoad: onLoad
    })
  })

  fs.createReadStream(file).pipe(tr)
}
