'use strict'

module.exports = runCases

var testCases = require('./node-test/index')

// A browser gives each case a fresh page, but here every case shares one process, so
// what a case does to the built-ins or adds to the global object is undone when it ends.
// quickCheckAPI.js replaces Array.from, for example, and many helpers assign undeclared globals.
var BUILT_INS = [
  Object, Function, Array, String, Number, Boolean, Symbol, Date, RegExp, Error, Promise,
  Map, Set, WeakMap, ArrayBuffer, DataView, Int8Array, Uint8Array, Uint8ClampedArray,
  Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array
].reduce(function(list, type) {
  return list.concat([type, type.prototype])
}, [Math, JSON, Reflect])

function sameDescriptor(a, b) {
  return Object.is(a.value, b.value) && a.get === b.get && a.set === b.set &&
    a.writable === b.writable && a.enumerable === b.enumerable && a.configurable === b.configurable
}

function saveGlobals() {
  return {
    globalNames: new Set(Object.getOwnPropertyNames(global)),
    builtIns: BUILT_INS.map(function(object) {
      var descriptors = new Map()
      Reflect.ownKeys(object).forEach(function(key) {
        descriptors.set(key, Object.getOwnPropertyDescriptor(object, key))
      })
      return descriptors
    })
  }
}

function restoreGlobals(saved) {
  BUILT_INS.forEach(function(object, i) {
    var descriptors = saved.builtIns[i]
    Reflect.ownKeys(object).forEach(function(key) {
      if (!descriptors.has(key)) {
        Reflect.deleteProperty(object, key)
      }
    })
    descriptors.forEach(function(descriptor, key) {
      var current = Object.getOwnPropertyDescriptor(object, key)
      if (!current || !sameDescriptor(current, descriptor)) {
        Object.defineProperty(object, key, descriptor)
      }
    })
  })
  Object.getOwnPropertyNames(global).forEach(function(name) {
    if (!saved.globalNames.has(name)) {
      Reflect.deleteProperty(global, name)
    }
  })
}

function runCases(environment) {
  var tape          = environment.tape
  var createContext = environment.createContext
  var filter        = environment.filter || function() { return true }

  testCases.forEach(function(testCase) {
    if(filter(testCase[0])) {
      tape(testCase[0], function(t) {
        var saved = saveGlobals()
        t.on('end', function() {
          restoreGlobals(saved)
        })
        var ENVIRONMENT = {
          tape: t,
          createContext: createContext,
        }
        var run = testCase[1]
        run(ENVIRONMENT)
      })
    }
  })
}
