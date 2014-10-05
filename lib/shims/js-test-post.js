//Skip shim

module.exports = function(ENVIRONMENT) {
  ENVIRONMENT.postHook = function() {
    ENVIRONMENT.tape.end()
  }
}