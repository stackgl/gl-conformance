var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var fs     = require('fs')
var path   = require('path')
var diff   = require('difference')

var BLACKLIST = require('./lib/bad-tests.json')

//Build conformance test suite
var scanFiles = require('./lib/scan-files')
var parseCase = require('./lib/parse-case')
var genCase   = require('./lib/compile-case')

var SUITE_DIR = path.join(
  __dirname, 
  'conformance-suites', 
  '1.0.2', 
  'conformance')

function fail(err) {
  console.error('crashing', err)
  process.exit(-1)
}

function basePath(file) {
  return path.relative(SUITE_DIR, file)
}

function writeManifest(fileList) {
  console.log('writing manifest...')
  fileList.sort()
  var code = [ 'module.exports=[' ]
  for(var i=0; i<fileList.length; ++i) {
    if(i > 0) {
      code.push(',')
    }
    code.push('["', fileList[i], '",require("./', fileList[i], '")]')
  }
  code.push(']')
  var codeStr = code.join('')
  fs.writeFile('./node-test/index.js', codeStr)
  console.log('done!')
}

function build() {
  scanFiles(function(err, files) {
    if(err) {
      fail(err)
    } else {
      var count = files.length
      var fileList = []
      var parsed = []
      function decCount() {
        if(--count === 0) {
          writeManifest(fileList)
        }
      }
      files.forEach(function(file) {
        if(BLACKLIST.indexOf(basePath(file)) >= 0) {
          console.log('skip ', file, 'blacklisted')
          decCount()
          return
        }
        parseCase(file, function(err, result) {
          if(err) {
            fail(err)
          } else {
            var str = genCase(result)
            if(str) {
              var fileName = result.caseName
              fileList.push(fileName)
              fs.writeFile(path.join('./node-test', fileName) + '.js' , str) 
            }
            decCount()
          }
        })
      })
    }
  })
}

//Clear directory and run build
rimraf('./node-test', function() {
  mkdirp('./node-test', build)
})