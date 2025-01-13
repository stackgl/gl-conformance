'use strict'

module.exports = globTestCases

var path = require('path')
var fs = require('fs')
var os = require('os')

function globTestCases (VERSION, cb) {
  var rootFile = path.join(__dirname, '../conformance-suites', VERSION, '00_test_list.txt')
  var result = []
  var pending = 0
  var failed = false
  var errors = []

  function fail (err) {
    errors.push(err)
    failed = true
    pending = pending - 1
    if (pending === 0) {
      cb(errors)
    }
  }

  function complete () {
    pending = pending - 1
    if (pending === 0) {
      if (failed) {
        cb(errors)
      } else {
        cb(null, result)
      }
    }
  }

  function glob (list) {
    pending = pending + 1
    fs.readFile(list, function (err, data) {
      if (err) {
        fail(err)
        return
      }
      var root = path.dirname(list)
      var lines = data.toString().split(os.EOL)
      for (var i = 0; i < lines.length; ++i) {
        var toks = lines[i].split(' ')
        if (toks.length === 0 || toks[0].indexOf('#') === 0) {
          continue
        }
        var file = toks[toks.length - 1]
        var ext = path.extname(file)
        var relpath = path.join(root, file)
        if (ext === '.txt') {
          glob(relpath)
        } else if (ext === '.html') {
          result.push(relpath)
        }
      }
      complete()
    })
  }

  glob(rootFile)
}
