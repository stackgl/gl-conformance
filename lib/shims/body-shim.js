module.exports = function createFakeBody (document) {
  return {
    appendChild: function (element) {
      // noop
    }
  }
}
