var callbacks = []

exports.requestAnimationFrame = function (callback) {
  callbacks.push([callback, setInterval(callback, 60)])
  return callback
}

exports.cancelAnimationFrame = function (callback) {
  for (var i = 0; i < callbacks.length; ++i) {
    if (callbacks[i][0] === callback) {
      clearInterval(callbacks[i][1])
      callbacks[i] = callbacks[callbacks.length - 1]
      callbacks.pop()
      return
    }
  }
}

exports.clear = function () {
  callbacks.forEach(function (entry) {
    clearInterval(entry[2])
  })
  callbacks = []
}
