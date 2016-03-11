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

function createFakeWindow (env) {
  return new FakeWindow(env)
}
