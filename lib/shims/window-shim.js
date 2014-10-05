'use strict'

module.exports = createFakeWindow

function FakeWindow(environment) {
  this.__ENV = environment
}

var proto = FakeWindow.prototype

proto.addEventListener = function(event, cb) {
  if(event === 'load') {
    setTimeout(cb, 1)
  }
}

function createFakeWindow(env) {
  return new FakeWindow(env)
}