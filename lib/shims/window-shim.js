'use strict'

module.exports = createFakeWindow

function FakeWindow (environment) {
  this.__ENV = environment
  this.screen = { width: 1, height: 1 }
}

var proto = FakeWindow.prototype

proto.addEventListener = function (event, cb) {
  if (event === 'load') {
    setTimeout(cb, 1)
  }
}

proto.scrollBy = function () {}

// In a browser these are globals, so they're also properties of window.
;[
  'ArrayBuffer', 'DataView',
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array',
  'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array'
].forEach(function (name) {
  proto[name] = global[name]
})

function createFakeWindow (env) {
  return new FakeWindow(env)
}
