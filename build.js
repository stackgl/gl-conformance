var rimraf = require('rimraf')
var mkdirp = require('mkdirp')
var fs = require('fs')
var path = require('path')

var BLACKLIST = require('./lib/blacklist.json')
var VERSION = '1.0.3'
var TEST_DIR = path.join(__dirname, 'node-test')

var SUITE_DIR = path.join(
  __dirname,
  'conformance-suites',
  VERSION,
  'conformance')

// We build shims ASAP because some scripts scan in shims immediately.
var buildShims = require('./lib/build-shims')
buildShims(SUITE_DIR)

// Build conformance test suite
var scanFiles = require('./lib/scan-files')
var parseCase = require('./lib/parse-case')
var genCase = require('./lib/compile-case')
var getResources = require('./lib/load-resources')

function fail (err) {
  console.error('crashing', err)
  process.exit(-1)
}

function basePath (file) {
  return path.relative(SUITE_DIR, file).replace(/\\/g, '/')
}

function writeManifest (fileList) {
  console.log('writing manifest...')
  fileList.sort()
  var code = [ 'module.exports=[' ]
  for (var i = 0; i < fileList.length; ++i) {
    if (i > 0) {
      code.push(',')
    }
    code.push('["', fileList[i], '",require("./', fileList[i], '")]')
  }
  code.push(']')
  var codeStr = code.join('')
  fs.writeFileSync('./node-test/index.js', codeStr)
  console.log('done!')
}

function build () {
  scanFiles(VERSION, function (err, files) {
    if (err) {
      fail(err)
    }
    var count = files.length
    var fileList = []
    function decCount () {
      if (--count === 0) {
        writeManifest(fileList)
      }
    }
    files.forEach(function (file) {
      if (BLACKLIST.indexOf(basePath(file)) >= 0) {
        console.log('skip ', file, 'blacklisted')
        decCount()
        return
      }
      parseCase(VERSION, file, function (err, result) {
        if (err) {
          fail(err)
        } else {
          var str = genCase(SUITE_DIR, result)
          if (str) {
            var fileName = result.caseName
            fileList.push(fileName)
            fs.writeFileSync(path.join(TEST_DIR, fileName) + '.js', str)
          }
          decCount()
        }
      })
    })
  })

  getResources(SUITE_DIR, function (err, resources) {
    if (err) {
      fail(err)
    }
    fs.writeFile(path.join(TEST_DIR, 'resources.json'), JSON.stringify(resources), function (err) {
      if (err) {
        fail(err)
      }
    })
  })
}

// Clear directory and run build
rimraf(TEST_DIR, function () {
  mkdirp(TEST_DIR, build)
})
