'use strict'

module.exports = runCases

var testCases = require('./node-test/index')

function runCases(environment) {
  var tape          = environment.tape
  var createContext = environment.createContext

  testCases.forEach(function(testCase) {
    tape(testCase[0], function(t) {
      var ENVIRONMENT = {
        tape: t,
        createContext: createContext,
      }
      var run = testCase[1]
      run(ENVIRONMENT)
    })
  })
}