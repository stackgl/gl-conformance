var callbacks = []

exports.requestAnimationFrame = function (callback) {
  var timeout
  setTimeout(function () {
    for (var i = 0; i < callbacks.length; ++i) {
      if (callbacks[i][0] === callback && callbacks[i][1] === timeout) {
        callbacks[i] = callbacks[callbacks.length - 1]
        callbacks.pop()
        break
      }
    }
    callback()
  }, 60)
  callbacks.push([callback, timeout])
  return callback
}

exports.cancelAnimationFrame = function (callback) {
  for (var i = 0; i < callbacks.length; ++i) {
    if (callbacks[i][0] === callback) {
      clearTimeout(callbacks[i][1])
      callbacks[i] = callbacks[callbacks.length - 1]
      callbacks.pop()
      return
    }
  }
}

exports.clear = function () {
  callbacks.forEach(function (entry) {
    clearTimeout(entry[2])
  })
  callbacks = []
}
