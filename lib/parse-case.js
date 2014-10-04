'use strict'

module.exports = parseTestCase

var trumpet = require('trumpet')
var fs      = require('fs')
var path    = require('path')
var concat  = require('concat-stream')

function parseTestCase(file, cb) {
  var tr = trumpet()
  var srcTags = []
  var scriptTags = []
  var shaders = {}

  var dirname = path.dirname(file)
  var root    = path.resolve(path.join(__dirname, '../conformance-suites/1.0.2/conformance'))

  tr.selectAll('script', function(elem) {
    var src = elem.getAttribute('src')
    if(src) {
      var relpath = path.relative(root, path.resolve(path.join(dirname, src)))
      srcTags.push(relpath)
    } else {
      var type = elem.getAttribute('type')
      if(type && type.indexOf('javascript') < 0) {
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

  tr.on('end', function() {
    cb(null, {
      name: file,
      directory: path.dirname(file),
      links: srcTags,
      scripts: scriptTags,
      shaders: shaders
    })
  })

  tr.on('error', function(err) {
    cb(err, null)
  })

  fs.createReadStream(file).pipe(tr)
}