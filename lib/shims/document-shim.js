module.exports = createFakeDocument

function FakeDocument(environment) {
  this.__ENV = environment
}

var proto = FakeDocument.prototype

function scanList(list, id) {
  for(var i=0; i<list.length; ++i) {
    if(list[i].id === id) {
      return list[i]
    }
  }
  return null
}

proto.getElementById = function(id) {
  return scanList(this.__ENV.canvasList, id) ||
         scanList(this.__ENV.scriptList, id) || {}
}

proto.createElement = function(type) {
  return {}
}

function createFakeDocument(environment) {
  return new FakeDocument(environment)
}